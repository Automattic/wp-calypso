import { useQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo, useEffect, useRef } from 'react';
import { userPaymentMethodsQuery } from '../../app/queries/me-payment-methods';
import { userPurchasesQuery, userTransferredPurchasesQuery } from '../../app/queries/me-purchases';
import { sitesQuery } from '../../app/queries/sites';
import { purchasesRoute } from '../../app/router/me';
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
import type { Site } from '../../data/site';
import type { Operator, View } from '@wordpress/dataviews';

function alterUrlForViewProp(
	url: URL,
	urlKey: string,
	currentViewPropValue: string | number | string[] | number[] | undefined,
	defaultValue?: string | number | undefined
): void {
	if ( currentViewPropValue && defaultValue && currentViewPropValue !== defaultValue ) {
		url.searchParams.set( urlKey, String( currentViewPropValue ) );
	} else if ( currentViewPropValue && ! defaultValue ) {
		url.searchParams.set( urlKey, String( currentViewPropValue ) );
	} else {
		url.searchParams.delete( urlKey );
	}
}

function persistViewToUrl( view: View, sites: Site[] ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	// Only persist certain view settings to the URL for now.
	const url = new URL( window.location.href );
	const siteId = view.filters?.find( ( filter ) => filter.field === 'site' )?.value;
	const siteSlug = sites.find( ( site ) => String( site.ID ) === String( siteId ) )?.slug;
	alterUrlForViewProp( url, 'site', siteSlug );
	window.history.pushState( undefined, '', url );
}

function updateViewFromSiteId( view: View, siteId: number ): View {
	return {
		...view,
		filters: [
			...( view.filters ?? [] ),
			{
				// Note: `value` must be a string to prevent the error:
				// `filterInView?.value?.includes is not a function`
				value: String( siteId ),
				operator: 'isAny' as Operator,
				field: 'site',
			},
		],
	};
}

function useSetInitialViewFromUrl( {
	sites,
	siteSlug,
	setView,
}: {
	sites: Array< Site > | undefined;
	siteSlug: string | undefined;
	setView: ( setter: View | ( ( view: View ) => View ) ) => void;
} ): void {
	const idFromSiteSlug = siteSlug
		? sites?.find( ( site ) => site.slug === siteSlug )?.ID
		: undefined;
	const didUpdateViewFromUrl = useRef( false );
	useEffect( () => {
		if ( ! idFromSiteSlug ) {
			return;
		}
		if ( didUpdateViewFromUrl.current ) {
			return;
		}
		didUpdateViewFromUrl.current = true;
		setView( ( view ) => updateViewFromSiteId( view, idFromSiteSlug ) );
	}, [ idFromSiteSlug, setView ] );
}

export default function PurchasesList() {
	const { site: siteSlug }: { site?: string } = purchasesRoute.useSearch();
	const { data: purchases, isLoading: isLoadingPurchases } = useQuery( userPurchasesQuery() );
	const { data: transferredPurchases, isLoading: isLoadingTransferredPurchases } = useQuery(
		userTransferredPurchasesQuery()
	);
	const { data: sites, isLoading: isLoadingSites } = useQuery( sitesQuery() );

	const [ currentView, setView ] = useState( purchasesDataView );
	useSetInitialViewFromUrl( {
		sites,
		siteSlug,
		setView,
	} );

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
		filterViewBySite: ( site: Site ) => {
			setView( ( view ) => {
				const newView = updateViewFromSiteId( view, site.ID );
				persistViewToUrl( newView, sites ?? [] );
				return newView;
			} );
		},
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

	const onChangeView = ( newView: View ) => {
		persistViewToUrl( newView, sites ?? [] );
		setView( newView );
	};

	return (
		<PageLayout size="large" header={ <PageHeader title={ __( 'Active Upgrades' ) } /> }>
			<div ref={ ref }>
				<DataViewsCard>
					<DataViews
						isLoading={ isLoadingPurchases || isLoadingTransferredPurchases || isLoadingSites }
						data={ filteredSubscriptions ?? [] }
						fields={ purchasesDataFields }
						view={ currentView }
						onChangeView={ onChangeView }
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
