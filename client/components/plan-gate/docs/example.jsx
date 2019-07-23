/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PlanGate from 'components/plan-gate';
import Button from 'components/button';
import { FEATURE_GOOGLE_MY_BUSINESS } from 'lib/plans/constants';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const PlanGateExample = () => (
	<div className="design-assets__group">
		<PlanGate feature={ FEATURE_GOOGLE_MY_BUSINESS }>
			<Button>Upgrade to Business</Button>
			<p>You've got the Google My Business feature</p>
		</PlanGate>
	</div>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

PlanGateExample.displayName = 'PlanGate';

export default PlanGateExample;
