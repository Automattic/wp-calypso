import config from '@automattic/calypso-config';
import { useQuery } from 'react-query';
import { useStore } from 'react-redux';
import { urlToSlug } from 'calypso/lib/url';
import wpcom from 'calypso/lib/wp';
import getSites from 'calypso/state/selectors/get-sites';
import {
	SiteExcerptData,
	SiteExcerptNetworkData,
	SITE_EXCERPT_REQUEST_FIELDS,
	SITE_EXCERPT_REQUEST_OPTIONS,
} from './site-excerpt-types';

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
		staleTime: 1000 * 60 * 5, // 5 minutes
		select: ( data ) => data?.sites.map( computeFields ),
		initialData: () => {
			// Not using `useSelector` (i.e. calling `getSites` directly) because we
			// only want to get the initial state. We don't want to be updated when the
			// data from `getSites` changes.
			const reduxData = getSites( store.getState() ).filter( notNullish );
			return reduxData.length ? { sites: reduxData } : undefined;
		},
		placeholderData: {
			sites: [],
		},
	} );
};

// This "null" check also does the type assertion that allows TypeScript to
// make strong guarantees about `t`.
function notNullish< T >( t: T | null | undefined ): t is T {
	return t !== null && t !== undefined;
}

function computeFields( data: SiteExcerptNetworkData ): SiteExcerptData {
	return {
		...data,
		// TODO: The algorithm Calypso uses to compute slugs is more sophisticated
		// because it deals with comflicting URLs (see /client/state/sites/selectors/get-site-slug.js)
		// We may need to request more site options to properly compute the slug.
		slug: urlToSlug( data.URL ),
	};
}
