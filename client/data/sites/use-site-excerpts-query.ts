import config from '@automattic/calypso-config';
import { SITE_EXCERPT_REQUEST_FIELDS, SITE_EXCERPT_REQUEST_OPTIONS } from '@automattic/sites';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getJetpackSiteCollisions, getUnmappedUrl } from 'calypso/lib/site/utils';
import { urlToSlug, withoutHttp } from 'calypso/lib/url';
import wpcom from 'calypso/lib/wp';
import { useStore } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import type { SiteExcerptData, SiteExcerptNetworkData } from '@automattic/sites';

export const USE_SITE_EXCERPTS_QUERY_KEY = 'sites-dashboard-sites-data';

export type SiteVisibility = 'all' | 'deleted';

const fetchSites = (
	site_visibility: SiteVisibility = 'all',
	siteFilter = config< string[] >( 'site_filter' ),
	additional_fields: string[] = [],
	additional_options: string[] = []
): Promise< { sites: SiteExcerptNetworkData[] } > => {
	return wpcom.me().sites( {
		apiVersion: '1.2',
		site_visibility,
		include_domain_only: true,
		site_activity: 'active',
		fields: additional_fields.concat( SITE_EXCERPT_REQUEST_FIELDS ).join( ',' ),
		options: additional_options.concat( SITE_EXCERPT_REQUEST_OPTIONS ).join( ',' ),
		filters: siteFilter.length > 0 ? siteFilter.join( ',' ) : undefined,
	} );
};

export const useSiteExcerptsQueryInvalidator = () => {
	const queryClient = useQueryClient();
	const invalidate = useCallback(
		() => queryClient.invalidateQueries( { queryKey: [ USE_SITE_EXCERPTS_QUERY_KEY ] } ),
		[ queryClient ]
	);
	return invalidate;
};

export const useSiteExcerptsQuery = (
	fetchFilter?: string[],
	sitesFilterFn?: ( site: SiteExcerptData ) => boolean,
	site_visibility: SiteVisibility = 'all',
	additional_fields: string[] = [],
	additional_options: string[] = [],
	enabled = true
) => {
	const store = useStore();

	return useQuery( {
		queryKey: [
			USE_SITE_EXCERPTS_QUERY_KEY,
			SITE_EXCERPT_REQUEST_FIELDS,
			SITE_EXCERPT_REQUEST_OPTIONS,
			fetchFilter,
			site_visibility,
			additional_fields,
			additional_options,
		],
		queryFn: () =>
			fetchSites( site_visibility, fetchFilter, additional_fields, additional_options ),
		select: ( data ) => {
			const sites = data?.sites.map( computeFields( data?.sites ) ) || [];
			return sitesFilterFn ? sites.filter( sitesFilterFn ) : sites;
		},
		initialData: () => {
			// Not using `useSelector` (i.e. calling `getSites` directly) because we
			// only want to get the initial state. We don't want to be updated when the
			// data from `getSites` changes.
			const reduxData = getSites( store.getState() ).filter( notNullish );
			return reduxData.length ? { sites: reduxData } : undefined;
		},
		enabled,
	} );
};

// This "null" check also does the type assertion that allows TypeScript to
// make strong guarantees about `t`.
function notNullish< T >( t: T | null | undefined ): t is T {
	return t !== null && t !== undefined;
}

// Gets the slug for a site, it also considers the unmapped URL,
// if the site is a redirect or the domain has a jetpack collision.
function getSiteSlug( site: SiteExcerptNetworkData, conflictingSites: number[] = [] ) {
	if ( ! site ) {
		return '';
	}

	const isSiteConflicting = conflictingSites.includes( site.ID );

	if ( site.options?.is_redirect || isSiteConflicting ) {
		return withoutHttp( getUnmappedUrl( site ) || '' );
	}

	return urlToSlug( site.URL );
}

function computeFields( allSites: SiteExcerptNetworkData[] ) {
	const conflictingSites = getJetpackSiteCollisions( allSites );
	return function computeFieldsSite( data: SiteExcerptNetworkData ): SiteExcerptData {
		const trimmedName = data.name?.trim() ?? '';
		const slug = getSiteSlug( data, conflictingSites );

		return {
			...data,
			title: trimmedName.length > 0 ? trimmedName : slug,
			slug,
		};
	};
}
