import { paginatedAgencySitesQuery } from '@automattic/api-queries';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { agencySitesRoute } from '../../app/router/agency';
import { DataViews, DataViewsCard, DataViewsEmptyStateLayout } from '../../components/dataviews';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { DEFAULT_PER_PAGE, DEFAULT_CONFIG, recordViewChanges } from '../../sites/dataviews/views';
import { getAgencyFields, getAgencyActions } from './dataviews';
import type { AgencySite, FetchAgencySitesOptions } from '@automattic/api-core';
import type { SupportedLayouts, View } from '@wordpress/dataviews';

const AGENCY_LAYOUTS: SupportedLayouts = {
	table: {
		showMedia: true,
		mediaField: 'site_icon',
		titleField: 'name',
		descriptionField: 'URL',
	},
	grid: {
		showMedia: true,
		mediaField: 'site_icon',
		titleField: 'name',
		descriptionField: 'URL',
	},
};

const DEFAULT_VIEW = {
	type: 'table',
	perPage: DEFAULT_PER_PAGE,
	mediaField: 'site_icon',
	titleField: 'name',
	descriptionField: 'URL',
	fields: [ 'agency_boost', 'agency_backup' ],
	sort: { field: 'URL', direction: 'asc' },
} as View;

// The agency endpoint only supports sorting by URL.
const SORT_FIELD_MAP: Record< string, 'url' > = { URL: 'url' };

function toAgencyFetchOptions( view: View ): FetchAgencySitesOptions {
	return {
		search: view.search,
		sort_field: view.sort?.field ? SORT_FIELD_MAP[ view.sort.field ] : undefined,
		sort_direction: view.sort?.direction,
		page: view.page,
		per_page: view.perPage,
	};
}

export default function AgencySites() {
	const { recordTracksEvent } = useAnalytics();
	const currentSearchParams = agencySitesRoute.useSearch();

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'agency-sites',
		defaultView: DEFAULT_VIEW,
		queryParams: currentSearchParams,
	} );

	const { data, isLoading, isPlaceholderData } = useQuery( {
		...paginatedAgencySitesQuery( toAgencyFetchOptions( view ) ),
		placeholderData: keepPreviousData,
	} );

	const sites = data?.sites ?? [];
	const totalItems = data?.total ?? 0;

	const handleViewChange = ( nextView: View ) => {
		recordViewChanges( view, nextView, recordTracksEvent );
		updateView( nextView );
	};

	const paginationInfo = {
		totalItems,
		totalPages: view.perPage ? Math.ceil( totalItems / view.perPage ) : 1,
	};

	return (
		<PageLayout header={ <PageHeader title={ __( 'Sites' ) } /> }>
			{ ! isLoading && <PerformanceTrackerStop /> }
			<DataViewsCard>
				<DataViews< AgencySite >
					getItemId={ ( item ) => item.blog_id.toString() }
					data={ sites }
					fields={ getAgencyFields( view.type, ( site ) =>
						recordTracksEvent( 'calypso_dashboard_sites_item_click', { site_id: site.blog_id } )
					) }
					actions={ getAgencyActions( recordTracksEvent ) }
					view={ view }
					isLoading={ isLoading }
					isPlaceholderData={ isPlaceholderData }
					onChangeView={ handleViewChange }
					onReset={ resetView }
					defaultLayouts={ AGENCY_LAYOUTS }
					paginationInfo={ paginationInfo }
					config={ DEFAULT_CONFIG }
					empty={
						view.search ? (
							<DataViewsEmptyStateLayout
								title={ __( 'No sites match your search' ) }
								description={ __( 'Try a different search term.' ) }
							/>
						) : (
							<DataViewsEmptyStateLayout
								title={ __( 'No sites' ) }
								description={ __( 'No agency-managed sites were found.' ) }
							/>
						)
					}
				/>
			</DataViewsCard>
		</PageLayout>
	);
}
