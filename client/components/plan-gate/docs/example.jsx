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
		<PlanGate
			feature={ FEATURE_GOOGLE_MY_BUSINESS }
			noFeatureContent={ <Button>Upgrade to Business</Button> }
			hasFeatureContent={ <p>You have got the Google My Business feature</p> }
		/>
	</div>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

PlanGateExample.displayName = 'PlanGate';

export default PlanGateExample;
