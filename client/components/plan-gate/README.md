Plan Gate
=========

A conditional component that displays the first child when a feature
is not present on customer's plan, and the second child when it is.

## Usage

```es6
import PlanGate from 'components/plan-gate';
import Button from 'components/button';
import { FEATURE_GOOGLE_MY_BUSINESS } from 'lib/plans/constants';

const PlanGateExample = () => {
	return (
		<div>
			<PlanGate feature={ FEATURE_GOOGLE_MY_BUSINESS }>
				<Button>Upgrade to Business</Button>
				<p>You've got the Google My Business feature</p>
			</PlanGate>
		</div>
	);
}
```
