import {
	userPaymentMethodsQuery,
	userPurchasesQuery,
	allSitesQuery,
	userTransferredPurchasesQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { purchasesRoute } from '../../app/router/me';
import { DataViews, DataViewsCard } from '../../components/dataviews';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { adjustDataViewFieldsForWidth } from '../../utils/dataviews-width';
import {
	WIDE_FIELDS,
	DESKTOP_FIELDS,
	MOBILE_FIELDS,
	DEFAULT_VIEW,
	getFields,
	getItemId,
	usePurchasesListActions,
} from './dataviews';

export default function PurchasesList() {
	const currentSearchParams = purchasesRoute.useSearch();
	const { data: purchases, isLoading: isLoadingPurchases } = useQuery( userPurchasesQuery() );
	const { data: transferredPurchases, isLoading: isLoadingTransferredPurchases } = useQuery(
		userTransferredPurchasesQuery()
	);
	const { data: sites, isLoading: isLoadingSites } = useQuery( allSitesQuery() );

	const [ defaultView, setDefaultView ] = useState( DEFAULT_VIEW );
	const { view, updateView, resetView } = usePersistentView( {
		slug: 'me-billing-purchases',
		defaultView,
		queryParams: currentSearchParams,
		queryParamFilterFields: [ 'site' ],
	} );

	const ref = useResizeObserver( ( entries ) => {
		const firstEntry = entries[ 0 ];
		if ( firstEntry ) {
			adjustDataViewFieldsForWidth( {
				width: firstEntry.contentRect.width,
				setView: setDefaultView,
				wideFields: WIDE_FIELDS,
				desktopFields: DESKTOP_FIELDS,
				mobileFields: MOBILE_FIELDS,
			} );
		}
	} );

	const { data: paymentMethods } = useQuery( userPaymentMethodsQuery( {} ) );
	const purchasesDataFields = getFields( {
		sites: sites ?? [],
		paymentMethods: paymentMethods ?? [],
		transferredPurchases: transferredPurchases ?? [],
		siteFilter: currentSearchParams.site,
	} );

	const allSubscriptions = useMemo( () => {
		return [ ...( purchases ?? [] ), ...( transferredPurchases ?? [] ) ];
	}, [ purchases, transferredPurchases ] );

	const { data: filteredSubscriptions, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( allSubscriptions, view, purchasesDataFields );
	}, [ allSubscriptions, view, purchasesDataFields ] );

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
						view={ view }
						onChangeView={ updateView }
						onResetView={ resetView }
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
