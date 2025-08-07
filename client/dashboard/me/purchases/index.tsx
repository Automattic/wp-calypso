import { useQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { userPaymentMethodsQuery } from '../../app/queries/me-payment-methods';
import { userPurchasesQuery, userTransferredPurchasesQuery } from '../../app/queries/me-purchases';
import { sitesQuery } from '../../app/queries/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { isTransferredOwnership } from '../../utils/purchase';
import {
	purchasesDataView,
	adjustViewFieldsForWidth,
	getFields,
	getItemId,
	getPurchaseUrl,
} from './dataviews';
import type { Purchase } from '../../data/purchase';

export default function PurchasesList() {
	const { data: purchases, isLoading: isLoadingPurchases } = useQuery( userPurchasesQuery() );
	const { data: transferredPurchases, isLoading: isLoadingTransferredPurchases } = useQuery(
		userTransferredPurchasesQuery()
	);
	const { data: sites } = useQuery( sitesQuery() );
	const [ currentView, setView ] = useState( purchasesDataView );
	const ref = useResizeObserver( ( entries ) => {
		const firstEntry = entries[ 0 ];
		if ( firstEntry ) {
			adjustViewFieldsForWidth( firstEntry.contentRect.width, setView );
		}
	} );
	const { data: paymentMethods } = useQuery( userPaymentMethodsQuery( {} ) );
	const purchasesDataFields = getFields( {
		sites: sites ?? [],
		paymentMethods: paymentMethods ?? [],
		transferredPurchases: transferredPurchases ?? [],
	} );
	const allSubscriptions = useMemo( () => {
		return [ ...( purchases ?? [] ), ...( transferredPurchases ?? [] ) ];
	}, [ purchases, transferredPurchases ] );
	const { data: filteredSubscriptions, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( allSubscriptions, currentView, purchasesDataFields );
	}, [ allSubscriptions, currentView, purchasesDataFields ] );

	const actions = useMemo(
		() => [
			{
				id: 'manage-purchase',
				label: __( 'Manage purchase' ),
				isEligible: ( item: Purchase ) => {
					// Hide manage button for transferred ownership purchases
					const hasTransferredOwnership = isTransferredOwnership(
						item.ID,
						transferredPurchases ?? []
					);
					return Boolean( item.domain && item.ID ) && ! hasTransferredOwnership;
				},
				callback: ( items: Purchase[] ) => {
					const item = items[ 0 ];
					window.location.href = getPurchaseUrl( item );
				},
			},
		],
		[ transferredPurchases ]
	);

	return (
		<PageLayout size="large" header={ <PageHeader title={ __( 'Active Upgrades' ) } /> }>
			<div ref={ ref }>
				<DataViews
					isLoading={ isLoadingPurchases || isLoadingTransferredPurchases }
					data={ filteredSubscriptions ?? [] }
					fields={ purchasesDataFields }
					view={ currentView }
					onChangeView={ setView }
					defaultLayouts={ { table: {} } }
					actions={ actions }
					getItemId={ getItemId }
					paginationInfo={ paginationInfo }
				/>
			</div>
		</PageLayout>
	);
}
