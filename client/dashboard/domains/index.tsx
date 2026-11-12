import { DomainSubtype } from '@automattic/api-core';
import { domainsQuery, sitesQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../app/analytics';
import { useAuth } from '../app/auth';
import { usePersistentView } from '../app/hooks/use-persistent-view';
import { PerformanceTrackerStop } from '../app/performance-tracking';
import { domainsIndexRoute } from '../app/router/domains';
import ComponentViewTracker from '../components/component-view-tracker';
import { DataViews, DataViewsCard, DataViewsEmptyStateLayout } from '../components/dataviews';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import AddDomainButton from './add-domain-button';
import {
	BulkActionsProgressNotice,
	DomainCardsLayout,
	filterSortAndPaginateDomains,
	getDomainId,
	useActions,
	useDomainsListLayouts,
	useFields,
	DOMAINS_LIST_CONFIG,
	DOMAINS_LIST_DEFAULT_VIEW,
	recordDomainViewChanges,
	sanitizeDomainFields,
	sanitizeDomainsListLayout,
	sanitizeDomainsListPageSize,
	withDomainsListDefaultLayout,
} from './dataviews';
import EmptyDomainsStateActions from './empty-domains-state/actions';
import { EmptyDomainsStateUpsell } from './empty-domains-state/upsell';
import type { DomainSummary } from '@automattic/api-core';

const defaultView = {
	...DOMAINS_LIST_DEFAULT_VIEW,
	filters: [
		{
			field: 'owner',
			operator: 'isAny' as const,
			value: [ 'owned-by-me' ],
		},
	],
};

function Domains() {
	const { user } = useAuth();
	const { recordTracksEvent } = useAnalytics();
	const fields = useFields( { showPrimaryDomainBadge: false } );
	const { data: sites } = useSuspenseQuery( sitesQuery() );
	const searchParams = domainsIndexRoute.useSearch();
	const { data: domains } = useSuspenseQuery( {
		...domainsQuery(),
		select: ( data ) => {
			return data.filter( ( domain ) => domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS );
		},
	} );

	const {
		view: persistentView,
		updateView,
		resetView,
	} = usePersistentView( {
		slug: 'domains',
		defaultView: withDomainsListDefaultLayout( defaultView, domains.length ),
		queryParams: searchParams,
		sanitizeFields: sanitizeDomainFields,
	} );
	const view = sanitizeDomainsListPageSize( sanitizeDomainsListLayout( persistentView ) );
	const {
		layouts,
		recordLayoutChoice,
		resetView: resetViewAndLayoutChoice,
	} = useDomainsListLayouts( { slug: 'domains', domainCount: domains.length, view, resetView } );

	const actions = useActions( { user, sites, domains, layout: view.type } );

	const { data: filteredData, paginationInfo } = filterSortAndPaginateDomains(
		domains ?? [],
		view,
		fields
	);

	const hasDomains = domains.length > 0;
	const isCardsLayout = view.type === 'grid';

	return (
		<>
			<PageLayout
				header={
					<PageHeader
						title={ __( 'Domain List' ) }
						actions={ ! hasDomains ? null : <AddDomainButton /> }
					/>
				}
				notices={ <BulkActionsProgressNotice /> }
			>
				{ ! hasDomains ? (
					<DataViewsEmptyStateLayout
						title={ __( 'Add your first domain name' ) }
						description={ __( 'Establish a unique online identity for your site.' ) }
					>
						<EmptyDomainsStateActions />
						<EmptyDomainsStateUpsell />
					</DataViewsEmptyStateLayout>
				) : (
					<DataViewsCard>
						<DataViews< DomainSummary >
							data={ filteredData || [] }
							fields={ fields }
							onChangeView={ ( nextView ) => {
								recordDomainViewChanges( view, nextView, recordTracksEvent );
								recordLayoutChoice( view, nextView );
								updateView( nextView );
							} }
							onReset={ resetViewAndLayoutChoice }
							view={ view }
							// The cards render their own actions.
							actions={ isCardsLayout ? undefined : actions }
							search
							paginationInfo={ paginationInfo }
							getItemId={ getDomainId }
							defaultLayouts={ layouts }
							config={ DOMAINS_LIST_CONFIG }
							empty={
								<DataViewsEmptyStateLayout
									title={ __( 'No domains match your search' ) }
									description={ __( 'Try again, or add a new domain with the options below.' ) }
									isBorderless
								>
									<EmptyDomainsStateActions />
								</DataViewsEmptyStateLayout>
							}
						>
							{ isCardsLayout ? (
								<DomainCardsLayout
									data={ filteredData }
									fields={ fields }
									actions={ actions }
									view={ view }
								/>
							) : undefined }
						</DataViews>
					</DataViewsCard>
				) }
			</PageLayout>
			{ view.type !== persistentView.type && (
				<ComponentViewTracker
					eventName="calypso_dashboard_domains_saved_layout_fallback"
					properties={ { saved_layout: persistentView.type, fallback_layout: view.type } }
				/>
			) }
			<PerformanceTrackerStop />
		</>
	);
}

export default Domains;
