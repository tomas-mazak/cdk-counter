import os
import boto3
import decimal

dynamodb = boto3.resource('dynamodb')


def handler(event, context):
    print(event)
    request_type = event['RequestType']
    if request_type == 'Create': return on_create(event)
    if request_type == 'Update': return on_update(event)
    if request_type == 'Delete': return on_delete(event)
    raise Exception("Invalid request type: %s" % request_type)


def on_create(event):
    props = event["ResourceProperties"]
    print("create new resource with props %s" % props)

    table = dynamodb.Table(os.getenv('DYNAMODB_TABLE_NAME'))
    response = table.update_item(
        Key={
            'key': props['key'],
        },
        UpdateExpression="set val = if_not_exists(val, :initial) + :increment",
        ExpressionAttributeValues={
            ':increment': 1,
            ':initial': 0,
        },
        ReturnValues="UPDATED_NEW"
    )

    value = int(response['Attributes']['val'])

    return { 'Data': { 'value': str(value) } }


def on_update(event):
    physical_id = event["PhysicalResourceId"]
    props = event["ResourceProperties"]
    print("update resource %s with props %s (no-op)" % (physical_id, props))


def on_delete(event):
    physical_id = event["PhysicalResourceId"]
    props = event["ResourceProperties"]
    print("delete resource %s" % physical_id)

    table = dynamodb.Table(os.getenv('DYNAMODB_TABLE_NAME'))
    response = table.update_item(
        Key={
            'key': props['key'],
        },
        UpdateExpression="set val = val - :increment",
        ExpressionAttributeValues={
            ':increment': 1, 
        },
        ReturnValues="UPDATED_NEW"
    )
