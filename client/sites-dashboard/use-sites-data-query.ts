import config from '@automattic/calypso-config';
import { useQuery } from 'react-query';
import { useStore } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { SiteData, SiteDataOptions } from 'calypso/state/ui/selectors/site-data';
import { notNullish } from './util';

// Performance-optimized request for lists of sites.
// Don't add more fields because you will make the request slower.
export const SITE_EXCERPT_REQUEST_FIELDS = [
	'ID',
	'URL',
	'is_coming_soon',
	'is_private',
	'launch_status',
	'slug',
	'icon',
	'name',
	'options',
	'plan',
] as const;

export const SITE_EXCERPT_REQUEST_OPTIONS = [ 'is_wpforteams_site' ] as const;

export type SiteExcerptData = Pick< SiteData, typeof SITE_EXCERPT_REQUEST_FIELDS[ number ] > & {
	options?: Pick< SiteDataOptions, typeof SITE_EXCERPT_REQUEST_OPTIONS[ number ] >;
};

const fetchSites = (): Promise< { sites: SiteExcerptData[] } > => {
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

export const useSitesDataQuery = () => {
	const sites = useStore().getState().sites.items;

	let reduxData = undefined;
	if ( sites && Object.values( sites ) ) {
		reduxData = {
			sites: Object.values( sites ).filter( notNullish ),
		};
	}

	return useQuery( [ 'sites-dashboard-sites-data' ], fetchSites, {
		staleTime: 1000 * 60 * 5, // 5 minutes
		select: ( data ) => data?.sites,
		initialData: reduxData,
		placeholderData: {
			sites: [],
		},
	} );
};
