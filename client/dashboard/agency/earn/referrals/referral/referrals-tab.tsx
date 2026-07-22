import {
	agencyProductsQuery,
	archiveReferralMutation,
	resendReferralEmailMutation,
} from '@automattic/api-queries';
import { Badge } from '@automattic/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import { DataViews, DataViewsCard } from '../../../../components/dataviews';
import { PageHeader } from '../../../../components/page-header';
import PageLayout from '../../../../components/page-layout';
import { Text } from '../../../../components/text';
import { useReferral } from '../hooks/use-referral';
import { getOrderSummary } from '../lib/get-order-summary';
import { getReferralStatus } from '../lib/get-referral-status';
import { sortReferralOrders } from '../lib/referral-orders';
import ReferralNotFound from './not-found';
import OrderSummary from './order-summary';
import type { ReferralApiResponse } from '@automattic/api-core';
import type { Action, Field, View } from '@wordpress/dataviews';

const DEFAULT_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: 20,
	titleField: 'summary',
	fields: [ 'status' ],
};

export default function ReferralReferralsTab() {
	const { referral, agencyId } = useReferral();
	const { data: products } = useQuery( agencyProductsQuery( agencyId ) );
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { mutate: archiveReferral, isPending: isArchiving } = useMutation(
		archiveReferralMutation( agencyId )
	);
	const { mutate: resendReferralEmail } = useMutation( resendReferralEmailMutation( agencyId ) );

	const fields = useMemo< Field< ReferralApiResponse >[] >(
		() => [
			{
				id: 'summary',
				label: __( 'Referral' ),
				enableHiding: false,
				enableSorting: false,
				getValue: ( { item } ) => getOrderSummary( item, products ),
				render: ( { item } ) => <OrderSummary order={ item } products={ products } />,
			},
			{
				id: 'status',
				label: __( 'Status' ),
				enableHiding: false,
				enableSorting: false,
				getValue: ( { item } ) => item.status,
				render: ( { item } ) => {
					const { status, type } = getReferralStatus( item.status );
					return <Badge intent={ type }>{ status }</Badge>;
				},
			},
		],
		[ products ]
	);

	const actions = useMemo< Action< ReferralApiResponse >[] >(
		() => [
			{
				id: 'resend-email',
				label: __( 'Resend email' ),
				isEligible: ( item ) => item.status === 'pending',
				callback: ( items ) => {
					const order = items[ 0 ];
					if ( ! order ) {
						return;
					}
					recordTracksEvent( 'calypso_a4a_referrals_resend_email_button_click' );
					resendReferralEmail( order.id, {
						onSuccess: () =>
							createSuccessNotice( __( 'The referral email has been resent.' ), {
								type: 'snackbar',
							} ),
						onError: () =>
							createErrorNotice( __( 'Failed to resend the referral email.' ), {
								type: 'snackbar',
							} ),
					} );
				},
			},
			{
				id: 'copy-link',
				label: __( 'Copy link' ),
				isEligible: ( item ) => item.status === 'pending' && !! item.checkout_url,
				callback: ( items ) => {
					const order = items[ 0 ];
					if ( ! order?.checkout_url ) {
						return;
					}
					recordTracksEvent( 'calypso_a4a_referrals_copy_link_button_click' );
					navigator.clipboard
						.writeText( order.checkout_url )
						.then( () =>
							createSuccessNotice( __( 'Link copied to clipboard.' ), { type: 'snackbar' } )
						)
						.catch( () =>
							createErrorNotice( __( 'Failed to copy the link to clipboard.' ), {
								type: 'snackbar',
							} )
						);
				},
			},
			{
				id: 'archive',
				label: __( 'Archive' ),
				isDestructive: true,
				isEligible: ( item ) => item.status !== 'archived' && item.status !== 'active',
				RenderModal: ( { items, closeModal } ) => {
					const order = items[ 0 ];
					const onConfirm = () => {
						if ( ! order ) {
							return;
						}
						recordTracksEvent( 'calypso_a4a_referrals_archive_referral_button_click' );
						archiveReferral( order.id, {
							onSuccess: () =>
								createSuccessNotice( __( 'The referral has been archived.' ), {
									type: 'snackbar',
								} ),
							onError: () =>
								createErrorNotice( __( 'Failed to archive the referral.' ), {
									type: 'snackbar',
								} ),
						} );
						closeModal?.();
					};
					return (
						<VStack spacing={ 4 }>
							<Text>
								{ __(
									"Your client won't be able to complete the purchases. If removed, you must create a new referral for any future purchases."
								) }
							</Text>
							<HStack justify="right">
								<Button
									__next40pxDefaultSize
									variant="tertiary"
									onClick={ () => closeModal?.() }
									disabled={ isArchiving }
									accessibleWhenDisabled
								>
									{ __( 'Cancel' ) }
								</Button>
								<Button
									__next40pxDefaultSize
									variant="primary"
									onClick={ onConfirm }
									isBusy={ isArchiving }
									disabled={ isArchiving }
									accessibleWhenDisabled
									isDestructive
								>
									{ __( 'Archive' ) }
								</Button>
							</HStack>
						</VStack>
					);
				},
			},
		],
		[
			archiveReferral,
			isArchiving,
			resendReferralEmail,
			createSuccessNotice,
			createErrorNotice,
			recordTracksEvent,
		]
	);

	const orders = useMemo(
		() => ( referral ? sortReferralOrders( referral.referrals ) : [] ),
		[ referral ]
	);

	const { data: paginatedOrders, paginationInfo } = useMemo(
		() => filterSortAndPaginate( orders, view, fields ),
		[ orders, view, fields ]
	);

	if ( ! referral ) {
		return <ReferralNotFound />;
	}

	return (
		<PageLayout header={ <PageHeader title={ __( 'Referrals' ) } /> }>
			<DataViewsCard>
				<DataViews< ReferralApiResponse >
					data={ paginatedOrders }
					fields={ fields }
					actions={ actions }
					view={ view }
					onChangeView={ setView }
					search={ false }
					getItemId={ ( item ) => String( item.id ) }
					defaultLayouts={ { table: { titleField: 'summary' } } }
					paginationInfo={ paginationInfo }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}
