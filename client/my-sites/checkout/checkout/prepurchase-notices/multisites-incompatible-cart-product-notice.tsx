/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal Dependencies
 */
import { getJetpackProductDisplayName } from 'lib/products-values/get-jetpack-product-display-name';
import type { Product } from 'lib/products-values/products-list';
import PrePurchaseNotice from './prepurchase-notice';

type Props = {
	products: Product[];
};

const MultisitesIncompatibleCartProductNotice = ( { products }: Props ) => {
	const translate = useTranslate();

	// Some names might no fit the component definition that `translate` require so
	// we make sure to make them all components
	const productNames = products.map( ( product ) => (
		<>{ getJetpackProductDisplayName( product ) }</>
	) );

	let content;
	if ( products.length === 1 ) {
		content = translate(
			"We're sorry, {{product/}} is not compatible with multisite WordPress installations at this time.",
			{
				components: {
					product: productNames[ 0 ],
				},
				comment: '`product` refers to the name of a product such as Jetpack Backup',
			}
		);
	} else {
		content = translate(
			"We're sorry, {{product1/}} and {{product2/}} are not compatible with multisite WordPress installations at this time.",
			{
				components: {
					product1: productNames[ 0 ],
					product2: productNames[ 1 ],
				},
				comment: '`product1` and `product2` refer to the name of products such as Jetpack Backup',
			}
		);
	}

	return <PrePurchaseNotice message={ content } />;
};

export default MultisitesIncompatibleCartProductNotice;
