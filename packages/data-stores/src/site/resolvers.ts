// wpcomRequest is a temporary rename while we're working on migrating generators to thunks
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteDetails, Domain, SiteSettings, Dispatch } from './types';

const isSimpleSite = window.location.host.endsWith( 'wordpress.com' );

/**
 * Attempt to find a site based on its id, and if not return undefined.
 * We are currently ignoring error messages and silently failing if we can't find a
 * site. This could be extended in the future by retrieving the `error` and
 * `message` strings returned by the API.
 *
 * @param siteId {number}	The site to look up
 */
export const getSite =
	( siteId: number ) =>
	async ( { dispatch }: Dispatch ) => {
		dispatch.fetchSite();
		try {
			if ( ! isSimpleSite ) {
				// in Atomic wp-admin sites, use apiFetch instead of wpcom-proxy-fetch because it doesn't work there.
				// this doesn't return the exact same results, but it solves many problems.
				if ( ! isSimpleSite ) {
					const site: SiteDetails = await apiFetch( {
						url: `https://public-api.wordpress.com/rest/v1/sites/${ encodeURIComponent( siteId ) }`,
						global: true,
						mode: 'cors',
						credentials: 'same-origin',
					} );
					return dispatch.receiveSite( siteId, site );
				}
			} else {
				const existingSite: SiteDetails | undefined = await wpcomRequest( {
					path: '/sites/' + encodeURIComponent( siteId ),
					apiVersion: '1.1',
				} );
				dispatch.receiveSite( siteId, existingSite );
			}
		} catch ( err ) {
			dispatch.receiveSiteFailed( siteId, undefined );
		}
	};

/**
 * Get all site domains
 *
 * @param siteId {number} The site id
 */
export const getSiteDomains =
	( siteId: number ) =>
	async ( { dispatch }: Dispatch ) => {
		const result: { domains: Domain[] } = await wpcomRequest( {
			path: '/sites/' + encodeURIComponent( siteId ) + '/domains',
			apiVersion: '1.2',
		} );
		dispatch.receiveSiteDomains( siteId, result?.domains );
	};

/**
 * Get all site settings
 *
 * @param siteId {number} The site id
 */
export const getSiteSettings =
	( siteId: number ) =>
	async ( { dispatch }: Dispatch ) => {
		const result: { settings: SiteSettings } = await wpcomRequest( {
			path: '/sites/' + encodeURIComponent( siteId ) + '/settings',
			apiVersion: '1.4',
		} );

		dispatch.receiveSiteSettings( siteId, result?.settings );
	};
