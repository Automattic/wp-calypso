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
import { getProductBySlug } from 'state/products-list/selectors';
import { getJetpackProductDisplayName } from 'lib/products-values/get-jetpack-product-display-name';
import { getSitePurchases } from 'state/purchases/selectors';
import type { Plan } from 'state/plans/types';
import type { RawSiteProduct } from 'state/sites/selectors/get-site-products';

type Site = {
	ID: number;
	slug: string;
};

type Props = {
	plan: Plan;
	productSlug: string;
	selectedSite: Site;
};

const IncludedProductNoticeContent: FunctionComponent< Props > = ( {
	plan,
	productSlug,
	selectedSite,
} ) => {
	const product = useSelector( ( state ) =>
		getProductBySlug( state, productSlug )
	) as RawSiteProduct;
	const translate = useTranslate();
	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSite?.ID ) );
	const purchase = isArray( purchases )
		? purchases.find( ( p ) => p.productSlug === plan.product_slug )
		: null;
	const purchaseId = purchase?.id;
	const subscriptionUrl = purchaseId
		? `/me/purchases/${ selectedSite.slug }/${ purchaseId }`
		: '/me/purchases/';

	return (
		<div className="checkout__duplicate-notice">
			<p className="checkout__duplicate-notice-message">
				{ translate(
					'You currently own Jetpack %(plan)s. The product you are about to purchase, {{product/}}, is already included in this plan.',
					{
						args: {
							plan: plan.product_name_short,
						},
						components: {
							product: getJetpackProductDisplayName( product ) as ReactElement,
						},
						comment:
							'The `plan` variable refers to the short name of the plan the customer owns already. `product` refers to the product in the cart that is already included in the plan.',
					}
				) }
			</p>
			<a className="checkout__duplicate-notice-link" href={ subscriptionUrl }>
				{ translate( 'Manage subscription' ) }
			</a>
		</div>
	);
};

export default IncludedProductNoticeContent;
