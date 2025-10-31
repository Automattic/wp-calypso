import {
	userPaymentMethodsQuery,
	userPurchasesQuery,
	userTransferredPurchasesQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { useAppContext } from '../../app/context';
import { purchasesRoute } from '../../app/router/me';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { adjustDataViewFieldsForWidth } from '../../utils/dataviews-width';
import {
	persistViewToUrl,
	useSetInitialViewFromUrl,
	updateViewFromField,
} from '../../utils/persist-view-to-url';
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

function persistPurchasesViewToUrl( view: View, sites: Site[] ): void {
	persistViewToUrl(
		view,
		'site',
		( siteId ) => sites.find( ( site ) => String( site.ID ) === String( siteId ) )?.slug ?? ''
	);
}

export default function PurchasesList() {
	const { queries } = useAppContext();
	const { site: siteSlug }: { site?: string } = purchasesRoute.useSearch();
	const { data: purchases, isLoading: isLoadingPurchases } = useQuery( userPurchasesQuery() );
	const { data: transferredPurchases, isLoading: isLoadingTransferredPurchases } = useQuery(
		userTransferredPurchasesQuery()
	);
	const { data: sites, isLoading: isLoadingSites } = useQuery( queries.sitesQuery() );

	const [ currentView, setView ] = useState( purchasesDataView );
	const idFromSiteSlug = siteSlug ? sites?.find( ( site ) => site.slug === siteSlug )?.ID : '';
	useSetInitialViewFromUrl( {
		fieldName: 'site',
		fieldValue: String( idFromSiteSlug ),
		setView,
	} );

	const ref = useResizeObserver( ( entries ) => {
		const firstEntry = entries[ 0 ];
		if ( firstEntry ) {
			adjustDataViewFieldsForWidth( {
				width: firstEntry.contentRect.width,
				setView,
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
			setView( ( view ) => {
				const newView = updateViewFromField( view, 'site', String( site.ID ) );
				persistPurchasesViewToUrl( newView, sites ?? [] );
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
		persistPurchasesViewToUrl( newView, sites ?? [] );
		setView( newView );
	};

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader prefix={ <Breadcrumbs length={ 2 } /> } title={ __( 'Active upgrades' ) } />
			}
		>
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
