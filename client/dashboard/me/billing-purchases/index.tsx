import {
	userPaymentMethodsQuery,
	userPurchasesQuery,
	userTransferredPurchasesQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useCallback } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { useAppContext } from '../../app/context';
import { usePersistentView } from '../../app/dataviews';
import { purchasesRoute } from '../../app/router/me';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { adjustDataViewFieldsForWidth } from '../../utils/dataviews-width';
import {
	purchasesWideFields,
	purchasesDesktopFields,
	purchasesMobileFields,
	purchasesDataView,
	getFields,
	getItemId,
	usePurchasesListActions,
} from './dataviews';
import type { Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export default function PurchasesList() {
	const { queries } = useAppContext();
	const currentSearchParams = purchasesRoute.useSearch();
	const { data: purchases, isLoading: isLoadingPurchases } = useQuery( userPurchasesQuery() );
	const { data: transferredPurchases, isLoading: isLoadingTransferredPurchases } = useQuery(
		userTransferredPurchasesQuery()
	);
	const { data: sites, isLoading: isLoadingSites } = useQuery( queries.sitesQuery() );

	const { view: currentView, updateView } = usePersistentView( {
		slug: 'purchases',
		defaultView: purchasesDataView,
		queryParams: currentSearchParams,
	} );

	// Ensure fields are always present (fallback if persisted view is corrupted)
	const viewWithFields = useMemo( () => {
		if ( ! currentView.fields || currentView.fields.length === 0 ) {
			return {
				...currentView,
				fields: purchasesDesktopFields,
			};
		}
		return currentView;
	}, [ currentView ] );

	const wrappedSetView = useCallback(
		( setter: View | ( ( view: View ) => View ) ) => {
			const newView = typeof setter === 'function' ? setter( viewWithFields ) : setter;
			updateView( newView );
		},
		[ viewWithFields, updateView ]
	);

	const ref = useResizeObserver( ( entries ) => {
		const firstEntry = entries[ 0 ];
		if ( firstEntry ) {
			adjustDataViewFieldsForWidth( {
				width: firstEntry.contentRect.width,
				setView: wrappedSetView,
				wideFields: purchasesWideFields,
				desktopFields: purchasesDesktopFields,
				mobileFields: purchasesMobileFields,
			} );
		}
	} );

	const { data: paymentMethods } = useQuery( userPaymentMethodsQuery( {} ) );
	const purchasesDataFields = getFields( {
		sites: sites ?? [],
		paymentMethods: paymentMethods ?? [],
		transferredPurchases: transferredPurchases ?? [],
		filterViewBySite: ( site: Site ) => {
			const newView: View = {
				...viewWithFields,
				filters: [
					...( viewWithFields.filters?.filter( ( f ) => f.field !== 'site' ) ?? [] ),
					{ field: 'site', operator: 'is' as const, value: String( site.ID ) },
				],
				page: 1,
			};
			updateView( newView );
		},
	} );

	const allSubscriptions = useMemo( () => {
		return [ ...( purchases ?? [] ), ...( transferredPurchases ?? [] ) ];
	}, [ purchases, transferredPurchases ] );

	const { data: filteredSubscriptions, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( allSubscriptions, viewWithFields, purchasesDataFields );
	}, [ allSubscriptions, viewWithFields, purchasesDataFields ] );

	const actions = usePurchasesListActions( {
		transferredPurchases: transferredPurchases ?? [],
	} );

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Active upgrades' ) }
					description={ __( 'View and manage your active plans and purchases.' ) }
				/>
			}
		>
			<div ref={ ref }>
				<DataViewsCard className="purchases-list__wrapper">
					<DataViews
						isLoading={ isLoadingPurchases || isLoadingTransferredPurchases || isLoadingSites }
						data={ filteredSubscriptions ?? [] }
						fields={ purchasesDataFields }
						view={ viewWithFields }
						onChangeView={ updateView }
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
