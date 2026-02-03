import { isAutomatticianQuery, siteBySlugQuery, siteByIdQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import {
	useQuery,
	useQueryClient,
	useSuspenseQuery,
	keepPreviousData,
} from '@tanstack/react-query';
import { Button, Modal } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import deepmerge from 'deepmerge';
import { useState, useEffect } from 'react';
import { Experiment } from 'calypso/lib/explat';
import { useAnalytics } from '../app/analytics';
import { useAuth } from '../app/auth';
import { useAppContext } from '../app/context';
import { usePersistentView } from '../app/hooks/use-persistent-view';
import { sitesRoute } from '../app/router/sites';
import { DataViewsEmptyStateLayout } from '../components/dataviews';
import OptInSurvey from '../components/opt-in-survey';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { isDashboardBackport } from '../utils/is-dashboard-backport';
import AddNewSite from './add-new-site';
import {
	SitesDataViews,
	useActions,
	useFields,
	getDefaultView,
	recordViewChanges,
	sanitizeFields,
} from './dataviews';
import { EmptySitesStateContent, EmptySitesSearchStateContent } from './empty-sites-state';
import { InviteAcceptedFlashMessage } from './invite-accepted-flash-message';
import { SitesNotices } from './notices';
import { OptInWelcomeModal } from './welcome-modal';
import type {
	FetchSitesOptions,
	FetchPaginatedSitesOptions,
	Site,
	DashboardFilters,
} from '@automattic/api-core';
import type { View, Filter } from '@wordpress/dataviews';

type SiteListQueryOptions = {
	isDefaultView?: boolean;
	isRestoringAccount: boolean;
	isAutomattician: boolean;
};

const getFetchSitesOptions = (
	view: View,
	{ isRestoringAccount, isAutomattician }: SiteListQueryOptions
): FetchSitesOptions => {
	const filters = view.filters ?? [];

	// Include A8C sites unless explicitly excluded from the filter.
	const shouldIncludeA8COwned =
		isAutomattician &&
		! filters.some( ( item: Filter ) => item.field === 'is_a8c' && item.value === false );

	if ( filters.find( ( item: Filter ) => item.field === 'is_deleted' && item.value === true ) ) {
		return { site_visibility: 'deleted', include_a8c_owned: shouldIncludeA8COwned };
	}

	return {
		// Some P2 sites are not retrievable unless site_visibility is set to 'all'.
		// See: https://github.com/Automattic/wp-calypso/pull/104220.
		site_visibility: view.search || shouldIncludeA8COwned || isRestoringAccount ? 'all' : 'visible',
		include_a8c_owned: shouldIncludeA8COwned,
	};
};

const getFetchPaginatedSitesOptions = (
	view: View,
	{ isDefaultView, isRestoringAccount, isAutomattician }: SiteListQueryOptions,
	siteFilters: DashboardFilters = {}
): FetchPaginatedSitesOptions => {
	const filters = view.filters ?? [];

	// Include A8C sites unless explicitly excluded from the filter.
	const shouldIncludeA8COwned =
		isAutomattician &&
		! filters.some( ( item: Filter ) => item.field === 'is_a8c' && item.value === false );

	const options: FetchPaginatedSitesOptions = {
		source: isDashboardBackport() && isDefaultView ? 'dashboard-site-list-default' : undefined,

		// Some P2 sites are not retrievable unless site_visibility is set to 'all'.
		// See: https://github.com/Automattic/wp-calypso/pull/104220.
		site_visibility: view.search || shouldIncludeA8COwned || isRestoringAccount ? 'all' : 'visible',
		include_a8c_owned: shouldIncludeA8COwned,
		search: view.search,
		sort_field: view.sort?.field,
		sort_direction: view.sort?.direction,
		page: view.page,
		per_page: view.perPage,
	};

	if ( filters.find( ( item: Filter ) => item.field === 'is_deleted' && item.value === true ) ) {
		options.site_visibility = 'deleted';
	}

	view.filters?.forEach( ( filter ) => {
		if ( filter.field === 'plan' && filter.value ) {
			const planSlugsByName = siteFilters.plan?.reduce(
				( acc, current ) => ( {
					...acc,
					[ current.name_en ]: [ ...( acc[ current.name_en ] || [] ), current.value ],
				} ),
				{} as Record< string, string[] >
			);
			options.plan = filter.value.map( ( v: string ) => planSlugsByName?.[ v ] ).flat();
		} else if ( filter.field === 'visibility' && filter.value ) {
			options.visibility = filter.value;
		}
	} );

	return options;
};

/**
 * Enables the correct site query based on feature flags.
 */
export function useSiteListQuery( view: View, options: SiteListQueryOptions ) {
	const { queries } = useAppContext();

	const { data: siteFilters } = useQuery( {
		...queries.dashboardSiteFiltersQuery( [ 'plan' ] ),
		staleTime: 5 * 60 * 1000, // Consider valid for 5 minutes
		enabled:
			isEnabled( 'dashboard/v2/paginated-site-list' ) &&
			!! view.filters?.find( ( filter ) => filter.field === 'plan' ),
	} );

	const sitesQueryResult = useQuery( {
		...queries.sitesQuery( getFetchSitesOptions( view, options ) ),
		placeholderData: keepPreviousData,
		enabled: ! isEnabled( 'dashboard/v2/paginated-site-list' ),
	} );

	const paginatedSitesQueryResult = useQuery( {
		...queries.paginatedSitesQuery( getFetchPaginatedSitesOptions( view, options, siteFilters ) ),
		placeholderData: keepPreviousData,
		enabled: isEnabled( 'dashboard/v2/paginated-site-list' ),
		meta: {
			fullPageLoader: true,
		},
	} );

	if ( isEnabled( 'dashboard/v2/paginated-site-list' ) ) {
		return {
			sites: paginatedSitesQueryResult.data?.sites,
			hasNoData: paginatedSitesQueryResult.data?.sites.length === 0,
			isLoadingSites: paginatedSitesQueryResult.isLoading,
			isPlaceholderData: paginatedSitesQueryResult.isPlaceholderData,
			totalItems: paginatedSitesQueryResult.data?.total,
		};
	}

	return {
		sites: sitesQueryResult.data,
		hasNoData: sitesQueryResult.data?.length === 0,
		isLoadingSites: sitesQueryResult.isLoading,
		isPlaceholderData: sitesQueryResult.isPlaceholderData,
		totalItems: sitesQueryResult.data?.length,
	};
}

function filterSortAndPaginateSites( sites: Site[], view: View, totalItems: number ) {
	return {
		data: sites,
		paginationInfo: {
			totalItems,
			totalPages: view.perPage ? Math.ceil( totalItems / view.perPage ) : 1,
		},
	};
}

export default function Sites() {
	const { recordTracksEvent } = useAnalytics();
	const queryClient = useQueryClient();
	const currentSearchParams = sitesRoute.useSearch();
	const isRestoringAccount = !! currentSearchParams.restored;

	const { user } = useAuth();
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );

	const defaultView = getDefaultView( {
		user,
		isAutomattician,
		isRestoringAccount,
	} );

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'sites',
		defaultView,
		queryParams: currentSearchParams,
		sanitizeFields,
	} );

	const { sites, isLoadingSites, isPlaceholderData, hasNoData, totalItems } = useSiteListQuery(
		view,
		{
			isDefaultView: ! resetView && ! view.search && view.page === 1,
			isRestoringAccount,
			isAutomattician,
		}
	);

	const fields = useFields( { isAutomattician, viewType: view.type } );
	const actions = useActions();

	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const handleViewChange = ( nextView: View ) => {
		if ( nextView.type === 'list' ) {
			return;
		}

		recordViewChanges( view, nextView, recordTracksEvent );

		updateView( nextView );
	};

	const userHasSites = user.site_count > 0;

	useEffect( () => {
		if ( sites ) {
			sites.forEach( ( site ) => {
				const updater = ( oldData?: Site ) => ( oldData ? deepmerge( oldData, site ) : site );
				queryClient.setQueryData( siteBySlugQuery( site.slug ).queryKey, updater );
				queryClient.setQueryData( siteByIdQuery( site.ID ).queryKey, updater );
			} );
		}
	}, [ sites, queryClient ] );

	const { data: filteredData, paginationInfo } = isEnabled( 'dashboard/v2/paginated-site-list' )
		? filterSortAndPaginateSites( sites ?? [], view, totalItems ?? 0 )
		: filterSortAndPaginate( sites ?? [], view, fields );

	return (
		<>
			{ ! isDashboardBackport() && <OptInWelcomeModal /> }
			<InviteAcceptedFlashMessage />
			{ isModalOpen && (
				<Modal title={ __( 'Add new site' ) } onRequestClose={ () => setIsModalOpen( false ) }>
					<AddNewSite context="sites-dashboard" />
				</Modal>
			) }
			<PageLayout
				header={
					<PageHeader
						title={ __( 'Sites' ) }
						actions={
							userHasSites && (
								<Button
									variant="primary"
									onClick={ () => setIsModalOpen( true ) }
									__next40pxDefaultSize
								>
									{ __( 'Add new site' ) }
								</Button>
							)
						}
					/>
				}
				notices={
					<>
						<SitesNotices />
						{ ! isDashboardBackport() && <OptInSurvey /> }
					</>
				}
			>
				{ userHasSites ? (
					<SitesDataViews
						view={ view }
						sites={ filteredData }
						fields={ fields }
						actions={ actions }
						isLoading={ isLoadingSites || ( isPlaceholderData && hasNoData ) }
						isPlaceholderData={ isPlaceholderData }
						empty={
							<DataViewsEmptyStateLayout
								title={ __( 'No sites match your search' ) }
								description={ __( 'Try again, or start a new site with the options below.' ) }
								isBorderless
							>
								<EmptySitesSearchStateContent />
							</DataViewsEmptyStateLayout>
						}
						paginationInfo={ paginationInfo }
						onChangeView={ handleViewChange }
						onResetView={ resetView }
					/>
				) : (
					<DataViewsEmptyStateLayout
						title={ __( 'You don’t have any sites yet' ) }
						description={ __(
							'Start a site and begin creating, coding, or exploring what WordPress can do.'
						) }
					>
						<EmptySitesStateContent />
					</DataViewsEmptyStateLayout>
				) }
			</PageLayout>
			{ /* ExPlat's Evergreen A/A Test Experiment:
			 *
			 * This continually starts a new experiment every week that doesn't render anything and
			 * shouldn't send any extra requests, just to help us ensure our experimentation system is
			 * working smoothly.
			 *
			 * This particular spot isn't special, it just needs somewhere to live.
			 *
			 * We use iso-week and iso-week-year in order to consistently change the experiment name every week.
			 * Assumes users have a somewhat working clock but shouldn't be a problem if they don't.
			 */ }
			<Experiment
				name={ ( () => {
					const now = new Date();
					const year = getISOWeekYear( now );
					const week = String( getISOWeek( now ) ).padStart( 2, '0' );
					return `explat_test_aa_weekly_calypso_${ year }_week_${ week }`;
				} )() }
				defaultExperience={ null }
				treatmentExperience={ null }
				loadingExperience={ null }
			/>
		</>
	);
}
