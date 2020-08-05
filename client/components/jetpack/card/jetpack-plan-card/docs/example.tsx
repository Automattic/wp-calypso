/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackPlanCard from 'components/jetpack/card/jetpack-plan-card';
import { planCardWithBadge, planCardWithDiscount } from '../fixture';

export default function JetpackPlanCardExample() {
	return (
		<div>
			<h3>Jetpack Plan Card with Badge</h3>
			<JetpackPlanCard { ...planCardWithBadge } />
			<br />
			<h3>Jetpack Plan Card with Discount</h3>
			<JetpackPlanCard { ...planCardWithDiscount } />
		</div>
	);
}

JetpackPlanCardExample.displayName = 'JetpackPlanCardExample';
