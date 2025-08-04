import { useQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { activeSubscriptionsQuery } from '../../app/queries/me-active-subscriptions';
import { paymentMethodsQuery } from '../../app/queries/me-payment-methods';
import { transferredPurchasesQuery } from '../../app/queries/me-transferred-purchases';
import { sitesQuery } from '../../app/queries/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import {
	purchasesDataView,
	adjustViewFieldsForWidth,
	getFields,
	getItemId,
	getPurchaseUrl,
} from './data-view-shared';
import { isTransferredOwnership } from './util';
import type { ActiveSubscription } from '../../data/me-active-subscriptions';

export default function ActiveSubscriptions() {
	const { data: activeSubscriptions, isLoading: isLoadingPurchases } = useQuery(
		activeSubscriptionsQuery( {} )
	);
	const { data: transferredPurchases, isLoading: isLoadingTransferredPurchases } = useQuery(
		transferredPurchasesQuery( {} )
	);
	const { data: sites } = useQuery( sitesQuery() );
	const [ currentView, setView ] = useState( purchasesDataView );
	const ref = useResizeObserver( ( entries ) => {
		const firstEntry = entries[ 0 ];
		if ( firstEntry ) {
			adjustViewFieldsForWidth( firstEntry.contentRect.width, setView );
		}
	} );
	const { data: paymentMethods } = useQuery( paymentMethodsQuery( {} ) );
	const purchasesDataFields = getFields( {
		sites: sites ?? [],
		paymentMethods: paymentMethods ?? [],
		transferredPurchases: transferredPurchases ?? [],
	} );
	const allSubscriptions = useMemo( () => {
		return [ ...( activeSubscriptions ?? [] ), ...( transferredPurchases ?? [] ) ];
	}, [ activeSubscriptions, transferredPurchases ] );
	const { data: filteredSubscriptions, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( allSubscriptions, currentView, purchasesDataFields );
	}, [ allSubscriptions, currentView, purchasesDataFields ] );

	const actions = useMemo(
		() => [
			{
				id: 'manage-purchase',
				label: __( 'Manage purchase' ),
				isEligible: ( item: ActiveSubscription ) => {
					// Hide manage button for transferred ownership purchases
					const hasTransferredOwnership = isTransferredOwnership(
						item.ID,
						transferredPurchases ?? []
					);
					return Boolean( item.domain && item.ID ) && ! hasTransferredOwnership;
				},
				callback: ( items: ActiveSubscription[] ) => {
					const item = items[ 0 ];
					window.location.href = getPurchaseUrl( item );
				},
			},
		],
		[ transferredPurchases ]
	);

	return (
		<PageLayout size="large" header={ <PageHeader title={ __( 'Active Subscriptions' ) } /> }>
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
