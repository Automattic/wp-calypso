import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, ReactNode, useCallback } from 'react';
import { A4A_SITES_LINK_NEEDS_SETUP } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { addQueryArgs } from 'calypso/lib/url';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ReferralDetailsTable from '../common/referral-details-table';
import StatusBadge from '../common/step-section-item/status-badge';
import type { ReferralPurchase } from '../types';

import './style.scss';

export default function ReferralPurchases( { purchases }: { purchases: ReferralPurchase[] } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { data, isFetching } = useProductsQuery();

	const handleAssignToSite = useCallback(
		( url: string ) => {
			dispatch( recordTracksEvent( 'calypso_a4a_referrals_assign_purchase_to_site_button_click' ) );
			page.redirect( url );
		},
		[ dispatch ]
	);

	const fields = useMemo(
		() => [
			{
				id: 'product-details',
				header: translate( 'Product Details' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: ReferralPurchase } ): ReactNode => {
					const product = data?.find( ( product ) => product.product_id === item.product_id );
					return isFetching ? <TextPlaceholder /> : product?.name;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'date',
				header: translate( 'Date' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: ReferralPurchase } ): ReactNode => {
					return item.date_assigned ? new Date( item.date_assigned ).toLocaleDateString() : '-';
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'assigned-to',
				header: translate( 'Assigned to' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: ReferralPurchase } ): ReactNode => {
					const product = data?.find( ( product ) => product.product_id === item.product_id );
					const isWPCOMLicense = product?.family_slug === 'wpcom-hosting';
					const redirectUrl = isWPCOMLicense
						? A4A_SITES_LINK_NEEDS_SETUP
						: item.license_key &&
						  addQueryArgs( { key: item.license_key }, '/marketplace/assign-license' );

					const isDisabled = item.status !== 'active' || isFetching || ! product || ! redirectUrl;

					return item.site_assigned ? (
						<Button
							className="referrals-purchases__assign-button"
							borderless
							href={ `/sites/overview/${ urlToSlug( item.site_assigned ) }` }
						>
							{ urlToSlug( item.site_assigned ) }
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
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'total',
				header: translate( 'Total' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: ReferralPurchase } ): ReactNode => {
					const product = data?.find( ( product ) => product.product_id === item.product_id );
					return isFetching ? <TextPlaceholder /> : `$${ product?.amount }`;
				},
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ translate, data, isFetching, handleAssignToSite ]
	);

	return (
		<ReferralDetailsTable
			heading={ translate( 'Purchases' ) }
			items={ purchases }
			fields={ fields }
		/>
	);
}
