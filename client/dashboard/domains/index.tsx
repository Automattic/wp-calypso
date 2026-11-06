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
	useFields,
	DOMAINS_LIST_CONFIG,
	DOMAINS_LIST_DEFAULT_VIEW,
	DOMAINS_LIST_GRID_ONLY_LAYOUTS,
	recordDomainViewChanges,
	sanitizeDomainFields,
	sanitizeDomainsListLayout,
	sanitizeDomainsListPageSize,
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

	const {
		view: persistentView,
		updateView,
		resetView,
	} = usePersistentView( {
		slug: 'domains',
		defaultView,
		queryParams: searchParams,
		sanitizeFields: sanitizeDomainFields,
	} );
	const view = sanitizeDomainsListPageSize( sanitizeDomainsListLayout( persistentView ) );

	const { data: domains } = useSuspenseQuery( {
		...domainsQuery(),
		select: ( data ) => {
			return data.filter( ( domain ) => domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS );
		},
	} );

	const actions = useActions( { user, sites, domains, layout: view.type } );

	const { data: filteredData, paginationInfo } = filterSortAndPaginateDomains(
		domains ?? [],
		view,
		fields
	);

	const hasDomains = domains.length > 0;

	return (
		<>
			<PageLayout
				header={
					<PageHeader
						title={ __( 'Domains' ) }
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
								updateView( nextView );
							} }
							onReset={ resetView }
							view={ view }
							search
							paginationInfo={ paginationInfo }
							getItemId={ getDomainId }
							defaultLayouts={ DOMAINS_LIST_GRID_ONLY_LAYOUTS }
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
							<DomainCardsLayout
								data={ filteredData }
								fields={ fields }
								actions={ actions }
								view={ view }
							/>
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
