/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackPlanCard from 'calypso/components/jetpack/card/jetpack-plan-card';
import { planCardWithBadge, planCardWithDiscount, deprecatedPlanCard } from '../fixture';

export default function JetpackPlanCardExample() {
	return (
		<div>
			<h3>Jetpack Plan Card with Badge</h3>
			<JetpackPlanCard { ...planCardWithBadge } />
			<br />
			<h3>Jetpack Plan Card with Discount</h3>
			<JetpackPlanCard { ...planCardWithDiscount } />
			<br />
			<h3>Deprecated Jetpack Plan Card</h3>
			<JetpackPlanCard { ...deprecatedPlanCard } />
		</div>
	);
}

JetpackPlanCardExample.displayName = 'JetpackPlanCardExample';
