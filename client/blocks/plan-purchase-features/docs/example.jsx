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
	PLAN_BUSINESS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY
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
			
			<h2>Personal Plan</h2>
			<PlanPurchaseFeatures plan={ PLAN_PERSONAL } />

			<h2>Jetpack Free</h2>
			<PlanPurchaseFeatures plan={ PLAN_JETPACK_FREE } />
			
			<h2>Jetpack Premium</h2>
			<PlanPurchaseFeatures plan={ PLAN_JETPACK_PREMIUM } />
			
			<h2>Jetpack Business</h2>
			<PlanPurchaseFeatures plan={ PLAN_JETPACK_BUSINESS } />
			
			<h2>Jetpack Premium Monthly</h2>
			<PlanPurchaseFeatures plan={ PLAN_JETPACK_PREMIUM_MONTHLY } />
			
			<h2>Jetpack Business Monthly</h2>
			<PlanPurchaseFeatures plan={ PLAN_JETPACK_BUSINESS_MONTHLY } />
		</div>
	);
}

PlanPurchaseFeaturesExample.displayName = 'PlanPurchaseFeaturesExample';

export default PlanPurchaseFeaturesExample;

