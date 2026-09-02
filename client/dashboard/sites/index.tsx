import { isAutomatticianQuery, siteBySlugQuery, siteByIdQuery } from '@automattic/api-queries';
import {
	useQuery,
	useQueryClient,
	useSuspenseQuery,
	keepPreviousData,
} from '@tanstack/react-query';
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import deepmerge from 'deepmerge';
import { useState, useEffect } from 'react';
import { Experiment } from 'calypso/lib/explat';
import AccountEmailBouncingNotice, {
	useShouldShowAccountEmailBouncingNotice,
} from '../app/account-email-bouncing-notice';
import { useAnalytics } from '../app/analytics';
import { useAuth } from '../app/auth';
import { useAppContext } from '../app/context';
import { usePersistentView } from '../app/hooks/use-persistent-view';
import RecoveryEmailMatchesAccountEmailNotice, {
	useShouldShowRecoveryEmailMatchesAccountEmailNotice,
} from '../app/recovery-email-matches-account-email-notice';
import { sitesRoute } from '../app/router/sites';
import SecurityKeyReregisterNotice, {
	useShouldShowSecurityKeyReregisterNotice,
} from '../app/security-key-reregister-notice';
import { DataViewsEmptyStateLayout } from '../components/dataviews';
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
	STAGING_FILTER_FIELD,
} from './dataviews';
import { useHasOnlyDeletedSites } from './deleted-sites';
import {
	EmptyDeletedSitesStateContent,
	EmptySitesStateContent,
	EmptySitesSearchStateContent,
} from './empty-sites-state';
import { InviteAcceptedFlashMessage } from './invite-accepted-flash-message';
import { SitesNoticeArbiter } from './notice-arbiter';
import type { FetchPaginatedSitesOptions, Site, DashboardFilters } from '@automattic/api-core';
import type { View, Filter } from '@wordpress/dataviews';

type SiteListQueryOptions = {
	isDefaultView?: boolean;
	isRestoringAccount: boolean;
	isAutomattician: boolean;
};

function isDeletedFilterActive( filters: Filter[] ): boolean {
	return filters.some( ( filter ) => filter.field === 'is_deleted' && filter.value === true );
}

function getIncludeStaging( filters: Filter[] ): boolean {
	const stagingFilter = filters.find( ( filter ) => filter.field === STAGING_FILTER_FIELD );
	return stagingFilter ? stagingFilter.value === true : false;
}

const getFetchPaginatedSitesOptions = (
	view: View,
	{ isDefaultView, isRestoringAccount, isAutomattician }: SiteListQueryOptions,
	siteFilters: DashboardFilters = {}
): FetchPaginatedSitesOptions => {
	const filters = view.filters ?? [];

	const isA8COwnedIncludedByFilter = ! filters.some(
		( item: Filter ) => item.field === 'is_a8c' && item.value === false
	);

	// Non-Automatticians can be members of a8c-owned sites but have no filter to
	// control their visibility, so always include them.
	const shouldIncludeA8COwned = ! isAutomattician || isA8COwnedIncludedByFilter;

	// Hidden sites are only returned under 'all', which we opt into when the user
	// searches, is restoring their account, or is an Automattician who wants a8c-owned
	// sites — some P2s are not retrievable otherwise.
	// See: https://github.com/Automattic/wp-calypso/pull/104220.
	const shouldRequestAllVisibility =
		!! view.search || isRestoringAccount || ( isAutomattician && isA8COwnedIncludedByFilter );

	const options: FetchPaginatedSitesOptions = {
		source: isDashboardBackport() && isDefaultView ? 'dashboard-site-list-default' : undefined,

		site_visibility: shouldRequestAllVisibility ? 'all' : 'visible',
		include_a8c_owned: shouldIncludeA8COwned,
		include_staging: getIncludeStaging( filters ),
		search: view.search,
		sort_field: view.sort?.field,
		sort_direction: view.sort?.direction,
		page: view.page,
		per_page: view.perPage,
	};

	if ( isDeletedFilterActive( filters ) ) {
		options.site_visibility = 'all';
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
	const queryClient = useQueryClient();

	const { queries } = useAppContext();

	const { data: siteFilters } = useQuery( {
		...queries.dashboardSiteFiltersQuery( [ 'plan' ] ),
		staleTime: 5 * 60 * 1000, // Consider valid for 5 minutes
		enabled: !! view.filters?.find( ( filter ) => filter.field === 'plan' ),
	} );

	const paginatedSitesQueryResult = useQuery( {
		...queries.paginatedSitesQuery( getFetchPaginatedSitesOptions( view, options, siteFilters ) ),
		placeholderData: keepPreviousData,
		meta: {
			fullPageLoader: true,
		},
	} );

	const result = {
		sites: paginatedSitesQueryResult.data?.sites,
		hasNoData: paginatedSitesQueryResult.data?.sites.length === 0,
		isLoadingSites: paginatedSitesQueryResult.isLoading,
		isPlaceholderData: paginatedSitesQueryResult.isPlaceholderData,
		totalItems: paginatedSitesQueryResult.data?.total,
	};

	useEffect( () => {
		if ( result.sites ) {
			result.sites.forEach( ( site ) => {
				const updater = ( oldData?: Site ) => ( oldData ? deepmerge( oldData, site ) : site );
				queryClient.setQueryData( siteBySlugQuery( site.slug ).queryKey, updater );
				queryClient.setQueryData( siteByIdQuery( site.ID ).queryKey, updater );
			} );
		}
	}, [ result.sites, queryClient ] );

	return result;
}

export function filterSortAndPaginateSites( sites: Site[], view: View, totalItems: number ) {
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
	const currentSearchParams = sitesRoute.useSearch();
	const isRestoringAccount = !! currentSearchParams.restored;

	const { user } = useAuth();
	const { supports } = useAppContext();
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );

	const isSecurityKeyReregisterRequired = useShouldShowSecurityKeyReregisterNotice();
	const showSecurityKeyReregisterNotice = supports.me && isSecurityKeyReregisterRequired;
	const hasOnlyDeletedSites = useHasOnlyDeletedSites();

	const isAccountEmailBouncing = useShouldShowAccountEmailBouncingNotice();
	const showAccountEmailBouncingNotice = supports.me && isAccountEmailBouncing;

	const isRecoveryEmailMatchingAccountEmail = useShouldShowRecoveryEmailMatchesAccountEmailNotice();
	const showRecoveryEmailMatchesAccountEmailNotice =
		supports.me && isRecoveryEmailMatchingAccountEmail;

	const defaultView = getDefaultView( {
		siteCount: user.site_count,
		isAutomattician,
		isRestoringAccount,
	} );

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'sites',
		defaultView,
		queryParams: currentSearchParams,
		queryParamFilterFields: [ 'is_deleted' ],
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
		recordViewChanges( view, nextView, recordTracksEvent );
		updateView( nextView );
	};

	const userHasSites = user.site_count > 0;

	const { data: filteredData, paginationInfo } = filterSortAndPaginateSites(
		sites ?? [],
		view,
		totalItems ?? 0
	);

	let emptySitesState = null;
	if ( hasOnlyDeletedSites === true ) {
		emptySitesState = (
			<DataViewsEmptyStateLayout
				title={ __( 'You don’t have any active sites' ) }
				description={ __( 'Restore a deleted site, or start a new one.' ) }
			>
				<EmptyDeletedSitesStateContent />
			</DataViewsEmptyStateLayout>
		);
	} else if ( hasOnlyDeletedSites === false ) {
		emptySitesState = (
			<DataViewsEmptyStateLayout
				title={ __( 'You don’t have any sites yet' ) }
				description={ __(
					'Start a site and begin creating, coding, or exploring what WordPress can do.'
				) }
			>
				<EmptySitesStateContent />
			</DataViewsEmptyStateLayout>
		);
	}

	const filters = view.filters ?? [];
	const hasActiveSearch = !! view.search;
	const hasActiveQuery = hasActiveSearch || filters.length > 0;

	return (
		<>
			<InviteAcceptedFlashMessage />
			{ isModalOpen && (
				<Modal title={ __( 'Add new site' ) } onRequestClose={ () => setIsModalOpen( false ) }>
					<AddNewSite
						context="sites-dashboard"
						aiSiteBuilderPath="/setup/ai-site-builder-onboarding"
					/>
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
									onClick={ () => {
										recordTracksEvent( 'calypso_dashboard_sites_add_new_site_clicked' );
										setIsModalOpen( true );
									} }
									__next40pxDefaultSize
								>
									{ __( 'Add new site' ) }
								</Button>
							)
						}
					/>
				}
				notices={
					<SitesNoticeArbiter>
						{ showSecurityKeyReregisterNotice && <SecurityKeyReregisterNotice /> }
						{ showAccountEmailBouncingNotice && <AccountEmailBouncingNotice /> }
						{ showRecoveryEmailMatchesAccountEmailNotice && (
							<RecoveryEmailMatchesAccountEmailNotice />
						) }
					</SitesNoticeArbiter>
				}
			>
				{ userHasSites || hasActiveQuery ? (
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
						onReset={ resetView }
					/>
				) : (
					emptySitesState
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
