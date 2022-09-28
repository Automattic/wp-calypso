import config from '@automattic/calypso-config';
import { useQuery } from 'react-query';
import { useStore } from 'react-redux';
import { getJetpackSiteCollisions, getUnmappedUrl } from 'calypso/lib/site/utils';
import { urlToSlug, withoutHttp } from 'calypso/lib/url';
import wpcom from 'calypso/lib/wp';
import getSites from 'calypso/state/selectors/get-sites';
import {
	SITE_EXCERPT_REQUEST_FIELDS,
	SITE_EXCERPT_REQUEST_OPTIONS,
} from './site-excerpt-constants';
import { SiteExcerptData, SiteExcerptNetworkData } from './site-excerpt-types';

const fetchSites = (): Promise< { sites: SiteExcerptNetworkData[] } > => {
	const siteFilter = config< string[] >( 'site_filter' );
	return wpcom.me().sites( {
		apiVersion: '1.2',
		site_visibility: 'all',
		include_domain_only: true,
		site_activity: 'active',
		fields: SITE_EXCERPT_REQUEST_FIELDS.join( ',' ),
		options: SITE_EXCERPT_REQUEST_OPTIONS.join( ',' ),
		filters: siteFilter.length > 0 ? siteFilter.join( ',' ) : undefined,
	} );
};

export const useSiteExcerptsQuery = () => {
	const store = useStore();

	return useQuery( [ 'sites-dashboard-sites-data' ], fetchSites, {
		select: ( data ) => data?.sites.map( computeFields( data?.sites ) ),
		initialData: () => {
			// Not using `useSelector` (i.e. calling `getSites` directly) because we
			// only want to get the initial state. We don't want to be updated when the
			// data from `getSites` changes.
			const reduxData = getSites( store.getState() ).filter( notNullish );
			return reduxData.length ? { sites: reduxData } : undefined;
		},
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
