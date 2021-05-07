/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { ReactElement, FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal Dependencies
 */
import { getJetpackProductDisplayName } from '@automattic/calypso-products';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import PrePurchaseNotice from './prepurchase-notice';
import type { SiteProduct } from 'calypso/state/sites/selectors/get-site-products';

import './style.scss';

type Site = {
	ID: number;
	slug: string;
};

type Props = {
	product: SiteProduct;
	selectedSite: Site;
};

const CartPlanOverlapsOwnedProductNotice: FunctionComponent< Props > = ( {
	product,
	selectedSite,
} ) => {
	const translate = useTranslate();
	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSite?.ID ) );
	const purchase = Array.isArray( purchases )
		? purchases.find( ( p ) => p.productSlug === product.productSlug )
		: null;
	const purchaseId = purchase?.id;
	const subscriptionUrl = purchaseId
		? `/me/purchases/${ selectedSite.slug }/${ purchaseId }`
		: '/me/purchases/';

	const message = translate(
		'You currently own {{product/}}. The plan you are about to purchase also includes this product. Consider removing your {{link}}{{product/}} subscription{{/link}}.',
		{
			comment: 'The `product` variable refers to the product the customer owns already',
			components: {
				link: <a href={ subscriptionUrl } />,
				product: getJetpackProductDisplayName( product ) as ReactElement,
			},
		}
	);

	return (
		<PrePurchaseNotice
			message={ message }
			linkUrl={ subscriptionUrl }
			linkText={ translate( 'Manage subscription' ) }
		/>
	);
};

export default CartPlanOverlapsOwnedProductNotice;
