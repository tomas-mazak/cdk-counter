import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';
import { CounterIncrement, CounterProvider } from './counter';

export class CounterStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const provider = new CounterProvider(this, 'CounterProvider', {
      name: 'MyLittleCounter',
    });
  }
}

export class IncrementStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const increment = new CounterIncrement(this, 'Increment', {
      counterName: 'MyLittleCounter',
      incrementKey: 'foo',
    });

    new CfnOutput(this, 'IncrementValue', {
      value: increment.value,
    });
  }
}