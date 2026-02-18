import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { ExternalLink } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { EXTERNAL_PRESSABLE_AUTH_URL } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { ReferralPurchase } from '../../types';
import AssignedTo from '../components/assigned-to';
import DateAssigned from '../components/date';
import ProductDetails from '../components/product-details';
import TotalAmount from '../components/total-amount';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

import './style.scss';

type PurchaseItemProps = {
	purchase: ReferralPurchase;
	data?: APIProductFamilyProduct[];
	isFetching: boolean;
};

const PurchaseItem = ( { purchase, data, isFetching }: PurchaseItemProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const handleAssignToSite = useCallback(
		( url: string ) => {
			dispatch( recordTracksEvent( 'calypso_a4a_referrals_assign_purchase_to_site_button_click' ) );
			page.redirect( url );
		},
		[ dispatch ]
	);

	const isPressablePlan = purchase.license?.license_key?.startsWith( 'pressable-' );

	return (
		<div className="referral-purchases-mobile">
			<div className="referral-purchases-mobile__content">
				<div className="referral-purchases-mobile__header">
					<h3>{ translate( 'Product Details' ).toUpperCase() }</h3>
				</div>
				<p className="referral-purchases-mobile__product-name">
					<ProductDetails purchase={ purchase } isFetching={ isFetching } data={ data } />
				</p>
			</div>
			<div className="referral-purchases-mobile__content">
				<h3>{ translate( 'Date' ).toUpperCase() }</h3>
				<p>
					<DateAssigned purchase={ purchase } />
				</p>
			</div>
			<div className="referral-purchases-mobile__content">
				<h3>{ translate( 'Site Details' ).toUpperCase() }</h3>
				{ isPressablePlan && (
					<ExternalLink href={ EXTERNAL_PRESSABLE_AUTH_URL }>
						{ translate( 'Manage in Pressable' ) }
					</ExternalLink>
				) }

				{ ! isPressablePlan && (
					<AssignedTo
						purchase={ purchase }
						data={ data }
						handleAssignToSite={ handleAssignToSite }
						isFetching={ isFetching }
					/>
				) }
			</div>
			<div className="referral-purchases-mobile__content">
				<h3>{ translate( 'Total' ).toUpperCase() }</h3>
				<p>
					<TotalAmount isFetching={ isFetching } data={ data } purchase={ purchase } />
				</p>
			</div>
		</div>
	);
};

const ReferralPurchasesMobile = ( { purchases }: { purchases: ReferralPurchase[] } ) => {
	const { data, isFetching } = useProductsQuery();

	return (
		<div className="referral-purchases-mobile__wrapper">
			{ purchases.map( ( purchase ) => (
				<PurchaseItem
					key={ `${ purchase.product_id }-${ purchase.referral_id }` }
					purchase={ purchase }
					data={ data }
					isFetching={ isFetching }
				/>
			) ) }
		</div>
	);
};

export default ReferralPurchasesMobile;
