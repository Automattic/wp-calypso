import { agencyProductsQuery, referralCommissionPayoutQuery } from '@automattic/api-queries';
import { Badge } from '@automattic/ui';
import { useQuery } from '@tanstack/react-query';
import { __experimentalGrid as Grid, __experimentalHStack as HStack } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import { useLocale } from '../../../../app/locale';
import { PageHeader } from '../../../../components/page-header';
import PageLayout from '../../../../components/page-layout';
import { Text } from '../../../../components/text';
import ConsolidatedViews from '../consolidated-views';
import { useReferral } from '../hooks/use-referral';
import { getOrderSummary } from '../lib/get-order-summary';
import { getProductName } from '../lib/get-product-name';
import { getPurchaseStatus } from '../lib/get-purchase-status';
import { getReferralStatus } from '../lib/get-referral-status';
import { getActivePurchases, sortReferralOrders } from '../lib/referral-orders';
import SubscriptionStatus from '../subscription-status';
import ReferralNotFound from './not-found';
import OrderSummary from './order-summary';
import PreviewListCard from './preview-list-card';
import type { AgencyProduct, ReferralApiResponse, ReferralPurchase } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

type PurchaseItem = ReferralPurchase & { _id: string };

const REFERRAL_LIST_VIEW: View = { type: 'list', titleField: 'summary', fields: [ 'status' ] };
const PURCHASE_LIST_VIEW: View = { type: 'list', titleField: 'product', fields: [ 'status' ] };

function StatusBadge( { status }: { status: string } ) {
	const { status: label, type } = getReferralStatus( status );
	return <Badge intent={ type }>{ label }</Badge>;
}

function PurchaseStatusBadge( { purchase }: { purchase: ReferralPurchase } ) {
	const { status, type } = getPurchaseStatus( purchase );
	return <Badge intent={ type }>{ status }</Badge>;
}

const getReferralFields = ( products?: AgencyProduct[] ): Field< ReferralApiResponse >[] => [
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
		render: ( { item } ) => <StatusBadge status={ item.status } />,
	},
];

const getPurchaseFields = ( products?: AgencyProduct[] ): Field< PurchaseItem >[] => [
	{
		id: 'product',
		label: __( 'Product' ),
		enableHiding: false,
		enableSorting: false,
		getValue: ( { item } ) => getProductName( item, products ),
	},
	{
		id: 'status',
		label: __( 'Status' ),
		enableHiding: false,
		enableSorting: false,
		getValue: ( { item } ) => item.status,
		render: ( { item } ) => <PurchaseStatusBadge purchase={ item } />,
	},
];

export default function ReferralOverview() {
	const locale = useLocale();
	const { referral, agencyId } = useReferral();
	const { data: commissionPayout, isLoading: isLoadingCommissionPayout } = useQuery(
		referralCommissionPayoutQuery( agencyId )
	);
	const { data: products } = useQuery( agencyProductsQuery( agencyId ) );
	const { recordTracksEvent } = useAnalytics();

	const referralFields = useMemo( () => getReferralFields( products ), [ products ] );
	const purchaseFields = useMemo( () => getPurchaseFields( products ), [ products ] );

	if ( ! referral ) {
		return <ReferralNotFound />;
	}

	const referralId = String( referral.id );
	const recentReferrals = sortReferralOrders( referral.referrals ).slice( 0, 5 );
	const recentPurchases: PurchaseItem[] = getActivePurchases( referral )
		.slice( 0, 5 )
		.map( ( purchase, index ) => ( {
			...purchase,
			_id: `${ purchase.referral_id }-${ purchase.product_id }-${ index }`,
		} ) );

	return (
		<PageLayout
			header={
				<PageHeader
					title={ referral.client.email }
					description={
						<HStack spacing={ 2 } justify="flex-start" alignment="center" expanded={ false }>
							<Text>{ __( 'Payment status' ) }</Text>
							<SubscriptionStatus item={ referral } />
						</HStack>
					}
				/>
			}
		>
			<ConsolidatedViews
				isSingleClient
				referrals={ [ referral ] }
				referralCommissionPayout={ commissionPayout }
				isLoadingCommissionPayout={ isLoadingCommissionPayout }
				locale={ locale }
				products={ products }
				recordTracksEvent={ recordTracksEvent }
			/>
			<Grid templateColumns="repeat(auto-fit, minmax(320px, 1fr))" gap={ 6 } align="start">
				<PreviewListCard
					title={ __( 'Recent referrals' ) }
					isEmpty={ recentReferrals.length === 0 }
					emptyText={ __( 'No referrals yet.' ) }
					seeAllTitle={ __( 'See all referrals' ) }
					seeAllHref={ `/earn/referrals/${ referralId }/orders` }
				>
					<DataViews< ReferralApiResponse >
						data={ recentReferrals }
						fields={ referralFields }
						view={ REFERRAL_LIST_VIEW }
						onChangeView={ () => {} }
						getItemId={ ( item ) => String( item.id ) }
						paginationInfo={ { totalItems: recentReferrals.length, totalPages: 1 } }
						defaultLayouts={ { list: {} } }
					>
						<DataViews.Layout />
					</DataViews>
				</PreviewListCard>
				<PreviewListCard
					title={ __( 'Recent purchases' ) }
					isEmpty={ recentPurchases.length === 0 }
					emptyText={ __( 'No purchases yet.' ) }
					seeAllTitle={ __( 'See all purchases' ) }
					seeAllHref={ `/earn/referrals/${ referralId }/purchases` }
				>
					<DataViews< PurchaseItem >
						data={ recentPurchases }
						fields={ purchaseFields }
						view={ PURCHASE_LIST_VIEW }
						onChangeView={ () => {} }
						getItemId={ ( item ) => item._id }
						paginationInfo={ { totalItems: recentPurchases.length, totalPages: 1 } }
						defaultLayouts={ { list: {} } }
					>
						<DataViews.Layout />
					</DataViews>
				</PreviewListCard>
			</Grid>
		</PageLayout>
	);
}
