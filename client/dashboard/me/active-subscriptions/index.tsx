import { useSuspenseQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { activeSubscriptionsQuery } from '../../app/queries/me-active-subscriptions';
import { paymentMethodsQuery } from '../../app/queries/me-payment-methods';
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
import type { ActiveSubscription } from '../../data/me-active-subscriptions';

export default function ActiveSubscriptions() {
	const { data: activeSubscriptions, isLoading } = useSuspenseQuery(
		activeSubscriptionsQuery( {} )
	);
	const { data: sites } = useSuspenseQuery( sitesQuery() );
	const [ currentView, setView ] = useState( purchasesDataView );
	const ref = useResizeObserver( ( entries ) => {
		const firstEntry = entries[ 0 ];
		if ( firstEntry ) {
			adjustViewFieldsForWidth( firstEntry.contentRect.width, setView );
		}
	} );
	const { data: paymentMethods } = useSuspenseQuery( paymentMethodsQuery( {} ) );
	const purchasesDataFields = getFields( {
		sites: sites ?? [],
		paymentMethods: paymentMethods ?? [],
	} );
	const { data: filteredSubscriptions, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( activeSubscriptions ?? [], currentView, purchasesDataFields );
	}, [ activeSubscriptions, currentView, purchasesDataFields ] );

	const actions = useMemo(
		() => [
			{
				id: 'manage-purchase',
				label: __( 'Manage purchase' ),
				isEligible: ( item: ActiveSubscription ) => {
					// FIXME: Hide manage button for transferred ownership purchases
					return Boolean( item.domain && item.ID );
				},
				callback: ( items: ActiveSubscription[] ) => {
					const item = items[ 0 ];
					window.location.href = getPurchaseUrl( item );
				},
			},
		],
		[]
	);

	return (
		<PageLayout size="large" header={ <PageHeader title={ __( 'Active Subscriptions' ) } /> }>
			<div ref={ ref }>
				<DataViews
					isLoading={ isLoading }
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
