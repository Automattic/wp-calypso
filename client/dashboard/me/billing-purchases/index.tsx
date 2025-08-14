import { useQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo, useEffect } from 'react';
import { userPaymentMethodsQuery } from '../../app/queries/me-payment-methods';
import { userPurchasesQuery, userTransferredPurchasesQuery } from '../../app/queries/me-purchases';
import { sitesQuery } from '../../app/queries/sites';
import { purchasesRoute } from '../../app/router';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import {
	purchasesDataView,
	adjustViewFieldsForWidth,
	getFields,
	getItemId,
	usePurchasesListActions,
} from './dataviews';
import type { Operator } from '@wordpress/dataviews';

export default function PurchasesList() {
	const { site: siteSlug }: { site?: string | undefined } = purchasesRoute.useSearch();
	const { data: purchases, isLoading: isLoadingPurchases } = useQuery( userPurchasesQuery() );
	const { data: transferredPurchases, isLoading: isLoadingTransferredPurchases } = useQuery(
		userTransferredPurchasesQuery()
	);
	const { data: sites, isLoading: isLoadingSites } = useQuery( sitesQuery() );
	const [ currentView, setView ] = useState( purchasesDataView );

	// Allow setting the site filter by query string.
	const idFromSiteSlug = siteSlug && sites?.find( ( site ) => site.slug === siteSlug )?.ID;
	useEffect( () => {
		if ( idFromSiteSlug ) {
			// Remove the query string from the URL
			const urlWithoutQuery =
				window.location.origin + window.location.pathname + window.location.hash;
			history.replaceState( {}, document.title, urlWithoutQuery );

			// Update the view to filter based on the site.
			setView( ( view ) => {
				return {
					...view,
					filters: [
						...( view.filters ?? [] ),
						{
							value: String( idFromSiteSlug ),
							operator: 'isAny' as Operator,
							field: 'site',
						},
					],
				};
			} );
		}
	}, [ idFromSiteSlug ] );

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

	const actions = usePurchasesListActions( {
		transferredPurchases: transferredPurchases ?? [],
	} );

	return (
		<PageLayout size="large" header={ <PageHeader title={ __( 'Active Upgrades' ) } /> }>
			<div ref={ ref }>
				<DataViewsCard>
					<DataViews
						isLoading={ isLoadingPurchases || isLoadingTransferredPurchases || isLoadingSites }
						data={ filteredSubscriptions ?? [] }
						fields={ purchasesDataFields }
						view={ currentView }
						onChangeView={ setView }
						defaultLayouts={ { table: {} } }
						actions={ actions }
						getItemId={ getItemId }
						paginationInfo={ paginationInfo }
					/>
				</DataViewsCard>
			</div>
		</PageLayout>
	);
}
