/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackProductCard from 'components/jetpack-product-card';
import {
	productCard,
	highlightedProductCard,
	productCardWithProductTypeAndBadgeAndStartingPriceAndDiscount,
	productCardWithLongTexts,
	expandedProductCardWithCategoriesAndMore,
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
			<h3>Jetpack Product Card with Product Type, Badge, Starting Price and Discount</h3>
			<JetpackProductCard { ...productCardWithProductTypeAndBadgeAndStartingPriceAndDiscount } />
			<br />
			<h3>Jetpack Product Card with Long Texts</h3>
			<JetpackProductCard { ...productCardWithLongTexts } />
			<br />
			<h3>Expanded Jetpack Product Card with Categories and More Link</h3>
			<JetpackProductCard { ...expandedProductCardWithCategoriesAndMore } />
		</div>
	);
}

JetpackProductCardExample.displayName = 'JetpackProductCardExample';
