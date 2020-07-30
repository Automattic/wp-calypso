/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { isArray } from 'lodash';
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal Dependencies
 */
import { getSitePurchases } from 'state/purchases/selectors';

type Product = {
	productSlug: string;
	productName: string;
};

type Site = {
	ID: number;
	slug: string;
};

type Props = {
	product: Product;
	selectedSite: Site;
};

const DuplicateProductNoticeContent: FunctionComponent< Props > = ( { product, selectedSite } ) => {
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
		<div className="checkout__duplicate-notice">
			<p className="checkout__duplicate-notice-message">
				{ translate(
					'You currently own %(product)s. The plan you are about to purchase also includes this product. Consider removing your {{link}}%(product)s subscription{{/link}}.',
					{
						args: {
							product: product.productName,
						},
						comment: 'The `product` variable refers to the product the customer owns already',
						components: {
							link: <a href={ subscriptionUrl } />,
						},
					}
				) }
			</p>
			<a className="checkout__duplicate-notice-link" href={ subscriptionUrl }>
				{ translate( 'Manage subscription' ) }
			</a>
		</div>
	);
};

export default DuplicateProductNoticeContent;
