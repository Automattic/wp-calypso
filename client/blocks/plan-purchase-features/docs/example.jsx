/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PlanPurchaseFeatures from '../';
import {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS
} from 'lib/plans/constants';

function PlanPurchaseFeaturesExample() {
	return (
		<div className="docs__design-assets-group">
			<h2>
				<a href="/devdocs/blocks/plan-purchase-features-example">Plan Purchase Features</a>
			</h2>
			
			<h2>Business Plan</h2>
			<PlanPurchaseFeatures plan={ PLAN_BUSINESS } />
			
			<h2>Premium Plan</h2>
			<PlanPurchaseFeatures plan={ PLAN_PREMIUM } />
		</div>
	);
}

PlanPurchaseFeaturesExample.displayName = 'PlanPurchaseFeaturesExample';

export default PlanPurchaseFeaturesExample;

