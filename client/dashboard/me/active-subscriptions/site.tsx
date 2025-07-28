import { useSuspenseQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { activeSubscriptionsQuery } from '../../app/queries/me-active-subscriptions';
import { sitesQuery } from '../../app/queries/sites';
import { activeSubscriptionsSiteRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import {
	purchasesDataView,
	adjustViewFieldsForWidth,
	getFields,
	getItemId,
} from './data-view-shared';

export default function ActiveSubscriptionsForSite() {
	const { siteSlug: siteSlugOrId } = activeSubscriptionsSiteRoute.useParams();
	const { data: activeSubscriptions, isLoading } = useSuspenseQuery(
		activeSubscriptionsQuery( { siteId: siteSlugOrId } )
	);
	const { data: sites, isLoading: isLoadingSites } = useSuspenseQuery( sitesQuery() );
	const [ currentView, setView ] = useState( purchasesDataView );
	const ref = useResizeObserver( ( entries ) => {
		const firstEntry = entries[ 0 ];
		if ( firstEntry ) {
			adjustViewFieldsForWidth( firstEntry.contentRect.width, setView );
		}
	} );
	const site = siteSlugOrId
		? sites?.find(
				( site ) => site.slug === siteSlugOrId || String( site.ID ) === String( siteSlugOrId )
		  )
		: undefined;
	const purchasesDataFields = getFields( site ? [ site ] : [] );
	const { data: filteredSubscriptions, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( activeSubscriptions ?? [], currentView, purchasesDataFields );
	}, [ activeSubscriptions, currentView, purchasesDataFields ] );

	const siteSlug = site?.slug;

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
						sprintf( __( 'Active Subscriptions for %(siteSlug)s' ), { siteSlug } )
					}
				/>
			}
		>
			<div>
				<a href="/v2/me/billing/active-subscriptions">{ __( 'View all active subscriptions' ) }</a>
			</div>
			<div ref={ ref }>
				<DataViews
					isLoading={ isLoading || isLoadingSites }
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
