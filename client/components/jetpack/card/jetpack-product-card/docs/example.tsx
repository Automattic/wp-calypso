/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card';
import {
	productCard,
	highlightedProductCard,
	ownedProductCard,
	productCardWithProductTypeAndBadge,
	productCardWithDiscount,
	expandedProductCardWithCategoriesAndMore,
	productCardWithCancelButton,
} from '../fixture';

export default function JetpackProductCardExample() {
	return (
		<div>
			<h3>Jetpack Product Card</h3>
			<JetpackProductCard { ...productCard } />
			<br />
			<h3>Highlighted Jetpack Product Card</h3>
			<JetpackProductCard { ...highlightedProductCard } />
			<br />
			<h3>Owned Jetpack Product Card</h3>
			<JetpackProductCard { ...ownedProductCard } />
			<br />
			<h3>Jetpack Product Card with Product Type and Badge</h3>
			<JetpackProductCard { ...productCardWithProductTypeAndBadge } />
			<br />
			<h3>Jetpack Product Card with Discount</h3>
			<JetpackProductCard { ...productCardWithDiscount } />
			<br />
			<h3>Expanded Jetpack Product Card with Features Categories and More Link</h3>
			<JetpackProductCard { ...expandedProductCardWithCategoriesAndMore } />
			<br />
			<h3>Jetpack Product Card with Cancel Button</h3>
			<JetpackProductCard { ...productCardWithCancelButton } />
		</div>
	);
}

JetpackProductCardExample.displayName = 'JetpackProductCardExample';
