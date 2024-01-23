// wpcomRequest is a temporary rename while we're working on migrating generators to thunks
import wpcomRequest from 'wpcom-proxy-request';
import type {
	CurrentTheme,
	SiteDetails,
	Domain,
	SiteSettings,
	Dispatch,
	NewSiteErrorResponse,
} from './types';

/**
 * Attempt to find a site based on its id, and if not return undefined.
 * We are currently ignoring error messages and silently failing if we can't find a
 * site. This could be extended in the future by retrieving the `error` and
 * `message` strings returned by the API.
 * @param siteId {number}	The site to look up
 */
export const getSite =
	( siteId: number ) =>
	async ( { dispatch }: Dispatch ) => {
		dispatch.fetchSite();
		try {
			const existingSite: SiteDetails | undefined = await wpcomRequest( {
				path: '/sites/' + encodeURIComponent( siteId ),
				apiVersion: '1.1',
				query: 'force=wpcom',
			} );
			dispatch.receiveSite( siteId, existingSite );
		} catch ( err ) {
			dispatch.receiveSiteFailed( siteId, err as NewSiteErrorResponse );
		}
	};

/**
 * Get all site domains
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

/**
 * Get current site theme
 * @param siteId {number} The site id
 */
export const getSiteTheme =
	( siteId: number ) =>
	async ( { dispatch }: Dispatch ) => {
		const theme: CurrentTheme = await wpcomRequest( {
			path: '/sites/' + encodeURIComponent( siteId ) + '/themes/mine',
			apiVersion: '1.1',
		} );

		dispatch.receiveSiteTheme( siteId, theme );
	};
