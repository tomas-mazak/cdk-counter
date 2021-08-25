import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cr from '@aws-cdk/custom-resources';
import * as ssm from '@aws-cdk/aws-ssm';

const PARAMETER_PREFIX = '/github.com/tomas-mazak/cdk-counter';

export interface CounterProviderProps {
    readonly name: string;
    readonly decrementOnDelete?: boolean;
}

export class CounterProvider extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: CounterProviderProps) {
        super(scope, id);

        const table = new dynamodb.Table(this, 'Table', {
            partitionKey: {
                name: 'key',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        const onEventHandler = new lambda.Function(this, 'Handler', {
            runtime: lambda.Runtime.PYTHON_3_8,
            code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda')),
            handler: 'index.handler',
            environment: {
                DYNAMODB_TABLE_NAME: table.tableName,
                DECREMENT_ON_DELETE: props.decrementOnDelete ? 'True' : '',
            },
        });

        table.grantReadWriteData(onEventHandler);

        const provider = new cr.Provider(this, 'Provider', {
            onEventHandler,
        });

        new ssm.StringParameter(scope, 'CustomResourceServiceToken', {
            parameterName: `${PARAMETER_PREFIX}/${props.name}/serviceToken`,
            stringValue: provider.serviceToken,
        });
    }
}

export interface CounterIncrementProps {
    readonly counterName: string;
    readonly incrementKey: string;
}

export class CounterIncrement extends cdk.Construct {
    public readonly value: string;

    constructor(scope: cdk.Construct, id: string, props: CounterIncrementProps) {
        super(scope, id);

        const cr = new cdk.CustomResource(this, 'CounterIncrement', {
            serviceToken: ssm.StringParameter.valueForStringParameter(this, `${PARAMETER_PREFIX}/${props.counterName}/serviceToken`),
            resourceType: 'Custom::CounterIncrement',
            properties: {
              key: props.incrementKey,
            },
        });

        this.value = cr.getAttString('value');
    }
}