import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { userPaymentMethodsQuery } from '../../app/queries/me-payment-methods';
import { userTransferredPurchasesQuery } from '../../app/queries/me-purchases';
import { siteBySlugQuery } from '../../app/queries/site';
import { sitePurchasesQuery } from '../../app/queries/site-purchases';
import { sitesQuery } from '../../app/queries/sites';
import { purchasesSiteRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { purchasesDataView, adjustViewFieldsForWidth, getFields, getItemId } from './dataviews';

export default function PurchasesForSite() {
	const { siteSlug } = purchasesSiteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );
	const { data: sites, isLoading: isLoadingSites } = useQuery( sitesQuery() );
	const { data: purchases, isLoading: isLoadingPurchases } = useQuery( {
		...sitePurchasesQuery( site?.ID ?? 0 ),
		enabled: Boolean( site?.ID ),
	} );
	const { data: transferredPurchases, isLoading: isLoadingTransferredPurchases } = useQuery(
		userTransferredPurchasesQuery()
	);
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

	if ( ! siteSlug ) {
		return null;
	}

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					title={
						// translators: siteSlug is the name of the site
						sprintf( __( 'Active Upgrades for %(siteSlug)s' ), { siteSlug } )
					}
				/>
			}
		>
			<div>
				<Link to="/v2/me/billing/purchases">{ __( 'View all active upgrades' ) }</Link>
			</div>
			<div ref={ ref }>
				<DataViews
					isLoading={ isLoadingPurchases || isLoadingTransferredPurchases || isLoadingSites }
					data={ filteredSubscriptions ?? [] }
					fields={ purchasesDataFields }
					view={ currentView }
					onChangeView={ setView }
					defaultLayouts={ { table: {} } }
					getItemId={ getItemId }
					paginationInfo={ paginationInfo }
				/>
			</div>
		</PageLayout>
	);
}
