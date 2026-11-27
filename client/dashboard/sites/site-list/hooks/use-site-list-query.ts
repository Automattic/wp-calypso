import {
	dashboardSiteFiltersQuery,
	paginatedSitesQuery,
	siteBySlugQuery,
	siteByIdQuery,
} from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import deepmerge from 'deepmerge';
import { useEffect } from 'react';
import { isDashboardBackport } from '../../../utils/is-dashboard-backport';
import { STAGING_FILTER_FIELD } from '../dataviews';
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

	const { data: siteFilters } = useQuery( {
		...dashboardSiteFiltersQuery( 'all', [ 'plan' ] ),
		staleTime: 5 * 60 * 1000, // Consider valid for 5 minutes
		enabled: !! view.filters?.find( ( filter ) => filter.field === 'plan' ),
	} );

	const paginatedSitesQueryResult = useQuery( {
		...paginatedSitesQuery( 'all', getFetchPaginatedSitesOptions( view, options, siteFilters ) ),
		meta: {
			fullPageLoader: true,
		},
	} );

	const result = {
		sites: paginatedSitesQueryResult.data?.sites,
		isLoadingSites: paginatedSitesQueryResult.isLoading,
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
