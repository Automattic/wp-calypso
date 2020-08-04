/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackIndividualProductCard from 'components/jetpack/card/jetpack-individual-product-card';
import { individualProductCardWithBadge, individualProductCardWithDiscount } from '../fixture';

export default function JetpackIndividualProductCardExample() {
	return (
		<div>
			<h3>Jetpack Bundle Card with Badge</h3>
			<JetpackIndividualProductCard { ...individualProductCardWithBadge } />
			<br />
			<h3>Jetpack Bundle Card with Discount</h3>
			<JetpackIndividualProductCard { ...individualProductCardWithDiscount } />
		</div>
	);
}

JetpackIndividualProductCardExample.displayName = 'JetpackIndividualProductCardExample';
