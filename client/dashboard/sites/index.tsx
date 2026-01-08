import { isAutomatticianQuery, siteBySlugQuery, siteByIdQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import {
	useQuery,
	useQueryClient,
	useSuspenseQuery,
	keepPreviousData,
} from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, Modal } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import deepmerge from 'deepmerge';
import { useState, useEffect } from 'react';
import { Experiment } from 'calypso/lib/explat';
import { useAnalytics } from '../app/analytics';
import { useAuth } from '../app/auth';
import { useAppContext } from '../app/context';
import { usePersistentView } from '../app/hooks/use-persistent-view';
import { sitesRoute } from '../app/router/sites';
import { DataViewsEmptyState } from '../components/dataviews';
import OptInSurvey from '../components/opt-in-survey';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { isDashboardBackport } from '../utils/is-dashboard-backport';
import AddNewSite from './add-new-site';
import {
	SitesDataViews,
	useActions,
	useFields,
	useFields__ES,
	getDefaultView,
	recordViewChanges,
	sanitizeFields,
} from './dataviews';
import { InviteAcceptedFlashMessage } from './invite-accepted-flash-message';
import noSitesIllustration from './no-sites-illustration.svg';
import { SitesNotices } from './notices';
import { SiteLink, SiteLink__ES } from './site-fields';
import { OptInWelcomeModal } from './welcome-modal';
import type {
	FetchSitesOptions,
	Site,
	FetchDashboardSiteListParams,
	DashboardSiteListSite,
	DashboardFilters,
} from '@automattic/api-core';
import type { View, Filter } from '@wordpress/dataviews';

type SiteListQueryOptions = {
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

	if ( filters.find( ( item: Filter ) => item.field === 'deleted' && item.value === true ) ) {
		return { site_visibility: 'deleted', include_a8c_owned: shouldIncludeA8COwned };
	}

	return {
		// Some P2 sites are not retrievable unless site_visibility is set to 'all'.
		// See: https://github.com/Automattic/wp-calypso/pull/104220.
		site_visibility: view.search || shouldIncludeA8COwned || isRestoringAccount ? 'all' : 'visible',
		include_a8c_owned: shouldIncludeA8COwned,
	};
};

function getFetchSiteListParams(
	view: View,
	// isRestoringAccount: boolean TODO: Add site visibility filtering,
	siteFilters: DashboardFilters = {}
): FetchDashboardSiteListParams {
	// The mapping from Dataview fields to Site Profiles fields.
	const mappedFields: Record< string, keyof DashboardSiteListSite > = {
		name: 'name',
		URL: 'url',
		'icon.ico': 'icon',
		backup: 'has_backup',
		// views: 'stats_views',
		plan: 'plan',
		wp_version: 'wordpress_version',
		is_a8c: 'is_a8c',
		// preview
		last_published: 'last_publish',
		// uptime
		views: 'views',
		visitors: 'visitors',
		subscribers_count: 'total_wpcom_subscribers',
		// links
		php_version: 'php_version',
		// storage
		host: 'hosting_provider_guess',
	};

	const additionalMappedFields: Record< string, ( keyof DashboardSiteListSite )[] > = {
		likes: [ 'enabled_modules' ],
		name: [ 'badge' ],
		plan: [ 'owner_id' ],
		preview: [ 'name', 'icon', 'url', 'private' ],
		visibility: [ 'wpcom_status', 'private' ],
	};

	// Always include ID and slug (for navigation), deleted (for styling), is_a8c (for included a8c owned) and other (for vip & self hosted jetpack)
	const fields: ( keyof DashboardSiteListSite )[] = [
		'blog_id',
		'slug',
		'deleted',
		'capabilities',
		'is_a8c',
		'is_atomic',
		'is_garden',
		'is_jetpack',
		'is_p2',
		'is_vip',
	];

	const getMappedFields = ( field: string ): ( keyof DashboardSiteListSite )[] => {
		const result: ( keyof DashboardSiteListSite )[] = [];
		if ( mappedFields[ field ] ) {
			result.push( mappedFields[ field ] );
		}

		if ( additionalMappedFields[ field ] ) {
			fields.push( ...additionalMappedFields[ field ] );
		}

		return result;
	};

	if ( view.showTitle && view.titleField ) {
		fields.push( ...getMappedFields( view.titleField ) );
	}

	if ( view.showMedia && view.mediaField ) {
		fields.push( ...getMappedFields( view.mediaField ) );
	}

	if ( view.showDescription && view.descriptionField ) {
		fields.push( ...getMappedFields( view.descriptionField ) );
	}

	view.fields?.forEach( ( field ) => {
		fields.push( ...getMappedFields( field ) );
	} );

	const planSlugsByName = siteFilters.plan?.reduce(
		( acc, current ) => ( {
			...acc,
			[ current.name_en ]: [ ...( acc[ current.name_en ] || [] ), current.value ],
		} ),
		{} as Record< string, string[] >
	);

	const filters = view.filters?.reduce( ( acc, current ) => {
		let value = current.value;
		if ( current.field === 'plan' && current.value ) {
			value = current.value.map( ( v: string ) => planSlugsByName?.[ v ] ).flat();
		}

		return {
			...acc,
			[ current.field ]: value,
		};
	}, {} );

	return {
		fields: Array.from( new Set( fields ) ).filter( Boolean ),
		s: view.search || undefined,
		filters,
		sort_by: mappedFields[ view.sort?.field ?? '' ],
		sort_direction: view.sort?.direction,
		page: view.page,
		per_page: view.perPage,
	};
}

/**
 * Enables the correct site query based on the dataviews/v2/es-site-list feature flag.
 */
export function useSiteListQuery( view: View, options: SiteListQueryOptions ) {
	const { queries } = useAppContext();

	const { data: siteFilters } = useQuery( {
		...queries.dashboardSiteFiltersQuery( [ 'plan' ] ),
		staleTime: 5 * 60 * 1000, // Consider valid for 5 minutes
		enabled:
			isEnabled( 'dashboard/v2/es-site-list' ) &&
			!! view.filters?.find( ( filter ) => filter.field === 'plan' ),
	} );

	const siteProfilesQueryResult = useQuery( {
		...queries.dashboardSiteListQuery( getFetchSiteListParams( view, siteFilters ) ),
		placeholderData: keepPreviousData,
		enabled: isEnabled( 'dashboard/v2/es-site-list' ),
		meta: {
			fullPageLoader: true,
		},
	} );

	const sitesQueryResult = useQuery( {
		...queries.sitesQuery( getFetchSitesOptions( view, options ) ),
		placeholderData: keepPreviousData,
		enabled: ! isEnabled( 'dashboard/v2/es-site-list' ),
	} );

	if ( isEnabled( 'dashboard/v2/es-site-list' ) ) {
		return {
			sites: [],
			sites__ES: siteProfilesQueryResult.data?.sites,
			hasNoData: siteProfilesQueryResult.data?.sites.length === 0,
			isLoadingSites: siteProfilesQueryResult.isLoading,
			isPlaceholderData: siteProfilesQueryResult.isPlaceholderData,
			totalItems: siteProfilesQueryResult.data?.total,
		};
	}

	return {
		sites: sitesQueryResult.data,
		sites__ES: [],
		hasNoData: sitesQueryResult.data?.length === 0,
		isLoadingSites: sitesQueryResult.isLoading,
		isPlaceholderData: sitesQueryResult.isPlaceholderData,
		totalItems: sitesQueryResult.data?.length,
	};
}

/**
 * Meant to stand in for the dataview's filterSortAndPaginate function when
 * the filtering has already been done on the backend by elasticsearch.
 */
export function filterSortAndPaginate__ES(
	sites: DashboardSiteListSite[],
	view: View,
	totalItems: number
) {
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
	const navigate = useNavigate( { from: sitesRoute.fullPath } );
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

	const { sites, sites__ES, isLoadingSites, isPlaceholderData, hasNoData, totalItems } =
		useSiteListQuery( view, { isRestoringAccount, isAutomattician } );

	const fields = useFields( { isAutomattician, viewType: view.type } );
	const fields__ES = useFields__ES( { isAutomattician, viewType: view.type } );
	const actions = useActions();

	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const handleViewChange = ( nextView: View ) => {
		if ( nextView.type === 'list' ) {
			return;
		}

		recordViewChanges( view, nextView, recordTracksEvent );

		updateView( nextView );
	};

	const hasFilterOrSearch = ( view.filters && view.filters.length > 0 ) || view.search;

	const emptyTitle = hasFilterOrSearch ? __( 'No sites found' ) : __( 'No sites' );

	let emptyDescription = __( 'Get started by creating a new site.' );
	if ( view.search ) {
		emptyDescription = sprintf(
			// Translators: %s is the search term used when looking for sites by title or domain name.
			__(
				'Your search for “%s” did not match any sites. Try searching by the site title or domain name.'
			),
			view.search
		);
	} else if ( hasFilterOrSearch ) {
		emptyDescription = __( 'Your search did not match any sites.' );
	}

	useEffect( () => {
		if ( sites && ! isEnabled( 'dashboard/v2/es-site-list' ) ) {
			sites.forEach( ( site ) => {
				const updater = ( oldData?: Site ) => ( oldData ? deepmerge( oldData, site ) : site );
				queryClient.setQueryData( siteBySlugQuery( site.slug ).queryKey, updater );
				queryClient.setQueryData( siteByIdQuery( site.ID ).queryKey, updater );
			} );
		}
	}, [ sites, queryClient ] );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites ?? [], view, fields );

	const { data: filteredData__ES, paginationInfo: paginationInfo__ES } = filterSortAndPaginate__ES(
		sites__ES ?? [],
		view,
		totalItems ?? 0
	);

	const emptyState = (
		<DataViewsEmptyState
			title={ emptyTitle }
			description={ emptyDescription }
			illustration={ <img src={ noSitesIllustration } alt="" width={ 408 } height={ 280 } /> }
			actions={
				<>
					{ view.search && (
						<Button
							__next40pxDefaultSize
							variant="secondary"
							onClick={ () => {
								navigate( {
									search: {
										...currentSearchParams,
										search: undefined,
									},
								} );
							} }
						>
							{ __( 'Clear search' ) }
						</Button>
					) }
					<Button __next40pxDefaultSize variant="primary" onClick={ () => setIsModalOpen( true ) }>
						{ __( 'Add new site' ) }
					</Button>
				</>
			}
		/>
	);

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
							<Button
								variant="primary"
								onClick={ () => setIsModalOpen( true ) }
								__next40pxDefaultSize
							>
								{ __( 'Add new site' ) }
							</Button>
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
				{ isEnabled( 'dashboard/v2/es-site-list' ) ? (
					<SitesDataViews< DashboardSiteListSite >
						getItemId={ ( item ) => '' + item.blog_id?.toString() + item.url?.value }
						view={ view }
						sites={ filteredData__ES }
						fields={ fields__ES }
						// TODO: actions={ actions }
						isLoading={ isLoadingSites || ( isPlaceholderData && hasNoData ) }
						empty={ emptyState }
						paginationInfo={ paginationInfo__ES }
						renderItemLink={ ( { item, ...props } ) => (
							<SiteLink__ES
								{ ...props }
								site={ item }
								onClick={ () => recordTracksEvent( 'calypso_dashboard_sites_item_click' ) }
							/>
						) }
						onChangeView={ handleViewChange }
						onResetView={ resetView }
					/>
				) : (
					<SitesDataViews< Site >
						getItemId={ ( item ) => item.ID.toString() }
						view={ view }
						sites={ filteredData }
						fields={ fields }
						actions={ actions }
						isLoading={ isLoadingSites || ( isPlaceholderData && hasNoData ) }
						empty={ emptyState }
						paginationInfo={ paginationInfo }
						onChangeView={ handleViewChange }
						onResetView={ resetView }
						renderItemLink={ ( { item, ...props } ) => (
							<SiteLink
								{ ...props }
								site={ item }
								onClick={ () => recordTracksEvent( 'calypso_dashboard_sites_item_click' ) }
							/>
						) }
					/>
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
