/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackBundleCard from 'components/jetpack-bundle-card';
import {
	productCardWithProductTypeAndBadge,
	productCardWithDiscount,
} from 'components/jetpack-product-card/fixture';

export default function JetpackBundleCardExample() {
	return (
		<div>
			<h3>Jetpack Product Card with Product Type and Badge</h3>
			<JetpackBundleCard { ...productCardWithProductTypeAndBadge } />
			<br />
			<h3>Jetpack Bundle Card with Discount</h3>
			<JetpackBundleCard { ...productCardWithDiscount } />
		</div>
	);
}

JetpackBundleCardExample.displayName = 'JetpackBundleCardExample';
