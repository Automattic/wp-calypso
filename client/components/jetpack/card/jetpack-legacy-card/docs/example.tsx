/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackLegacyCard from 'components/jetpack/card/jetpack-legacy-card';
import { legacyCardWithBadge, legacyCardWithDiscount } from '../fixture';

export default function JetpackLegacyCardExample() {
	return (
		<div>
			<h3>Jetpack Legacy Card with Badge</h3>
			<JetpackLegacyCard { ...legacyCardWithBadge } />
			<br />
			<h3>Jetpack Legacy Card with Discount</h3>
			<JetpackLegacyCard { ...legacyCardWithDiscount } />
		</div>
	);
}

JetpackLegacyCardExample.displayName = 'JetpackLegacyCardExample';
