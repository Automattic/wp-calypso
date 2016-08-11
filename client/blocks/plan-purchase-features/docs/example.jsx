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

export default function PlanPurchaseFeaturesExample() {
	return (
		<div className="docs__design-assets-group">
			<h2>
				<a href="/devdocs/blocks/post-status">Plan Purchase Features</a>
			</h2>
			<Card>
				<PlanPurchaseFeatures plan={ PLAN_BUSINESS } />
			</Card>
		</div>
	);
}

