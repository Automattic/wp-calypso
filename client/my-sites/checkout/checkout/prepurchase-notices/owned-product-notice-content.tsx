/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { isArray } from 'lodash';
import React, { ReactElement, FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal Dependencies
 */
import { getJetpackProductDisplayName } from 'lib/products-values/get-jetpack-product-display-name';
import { getSitePurchases } from 'state/purchases/selectors';
import type { SiteProduct } from 'state/sites/selectors/get-site-products';

import './style.scss';

type Site = {
	ID: number;
	slug: string;
};

type Props = {
	product: SiteProduct;
	selectedSite: Site;
};

const OwnedProductNoticeContent: FunctionComponent< Props > = ( { product, selectedSite } ) => {
	const translate = useTranslate();
	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSite?.ID ) );
	const purchase = isArray( purchases )
		? purchases.find( ( p ) => p.productSlug === product.productSlug )
		: null;
	const purchaseId = purchase?.id;
	const subscriptionUrl = purchaseId
		? `/me/purchases/${ selectedSite.slug }/${ purchaseId }`
		: '/me/purchases/';

	return (
		<div className="owned-product-notice-content">
			<p className="owned-product-notice-content__message">
				{ translate(
					'You currently own {{product/}}. The plan you are about to purchase also includes this product. Consider removing your {{link}}{{product/}} subscription{{/link}}.',
					{
						comment: 'The `product` variable refers to the product the customer owns already',
						components: {
							link: <a href={ subscriptionUrl } />,
							product: getJetpackProductDisplayName( product ) as ReactElement,
						},
					}
				) }
			</p>
			<a className="owned-product-notice-content__link" href={ subscriptionUrl }>
				{ translate( 'Manage subscription' ) }
			</a>
		</div>
	);
};

export default OwnedProductNoticeContent;
