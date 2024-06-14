import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { A4A_SITES_LINK_NEEDS_SETUP } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { addQueryArgs, urlToSlug } from 'calypso/lib/url';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import StatusBadge from '../../common/step-section-item/status-badge';
import { ReferralPurchase } from '../../types';
import './style.scss';

type PurchaseItemProps = {
	purchase: ReferralPurchase;
	data?: APIProductFamilyProduct[];
	isFetching: boolean;
};

const PurchaseItem = ( { purchase, data, isFetching }: PurchaseItemProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const product = data?.find( ( product ) => product.product_id === purchase.product_id );
	const isWPCOMLicense = product?.family_slug === 'wpcom-hosting';
	const redirectUrl = isWPCOMLicense
		? A4A_SITES_LINK_NEEDS_SETUP
		: purchase.license_key &&
		  addQueryArgs( { key: purchase.license_key }, '/marketplace/assign-license' );

	const isDisabled = purchase.status !== 'active' || isFetching || ! product || ! redirectUrl;

	const handleAssignToSite = useCallback(
		( url: string ) => {
			dispatch( recordTracksEvent( 'calypso_a4a_referrals_assign_purchase_to_site_button_click' ) );
			page.redirect( url );
		},
		[ dispatch ]
	);

	return (
		<div className="testmenow">
			<div className="referral-purchases-mobile">
				<div className="referral-purchases-mobile__content">
					<div className="referral-purchases-mobile__header">
						<h3>{ translate( 'Product Details' ).toUpperCase() }</h3>
					</div>
					<p className="referral-purchases-mobile__product-name">
						{ isFetching ? <TextPlaceholder /> : product?.name }
					</p>
				</div>
				<div className="referral-purchases-mobile__content">
					<h3>{ translate( 'Date' ).toUpperCase() }</h3>
					<p>
						{ purchase.date_assigned
							? new Date( purchase.date_assigned ).toLocaleDateString()
							: '-' }
					</p>
				</div>
				<div className="referral-purchases-mobile__content">
					<h3>{ translate( 'Assigned to' ).toUpperCase() }</h3>
					{ purchase.site_assigned ? (
						<Button
							className="referrals-purchases__assign-button"
							borderless
							href={ `/sites/overview/${ urlToSlug( purchase.site_assigned ) }` }
						>
							{ urlToSlug( purchase.site_assigned ) }
						</Button>
					) : (
						<>
							<StatusBadge
								statusProps={ { children: translate( 'Unassigned' ), type: 'warning' } }
							/>

							<Button
								disabled={ isDisabled }
								className="referrals-purchases__assign-button"
								borderless
								onClick={ () => handleAssignToSite( redirectUrl ) }
							>
								{ isWPCOMLicense ? translate( 'Create site' ) : translate( 'Assign to site' ) }
							</Button>
						</>
					) }
				</div>
				<div className="referral-purchases-mobile__content">
					<h3>{ translate( 'Total' ).toUpperCase() }</h3>
					<p>{ isFetching ? <TextPlaceholder /> : `$${ product?.amount }` }</p>
				</div>
			</div>
		</div>
	);
};

const ReferralPurchasesMobile = ( { purchases }: { purchases: ReferralPurchase[] } ) => {
	const { data, isFetching } = useProductsQuery();

	return (
		<div className="referral-purchases-mobile__wrapper">
			{ purchases.map( ( purchase ) => (
				<PurchaseItem purchase={ purchase } data={ data } isFetching={ isFetching } />
			) ) }
		</div>
	);
};

export default ReferralPurchasesMobile;
