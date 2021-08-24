import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Counter from '../lib/counter-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Counter.CounterStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
