import { dispatch } from '@wordpress/data';
import { wpcomRequest } from '../wpcom-request-controls';
import { STORE_KEY } from './constants';
import type {
	SiteDetails,
	Domain,
	SiteSettings,
	HappyChatAvailability,
	EmailSupportAvailability,
} from './types';

/**
 * Attempt to find a site based on its id, and if not return undefined.
 * We are currently ignoring error messages and silently failing if we can't find a
 * site. This could be extended in the future by retrieving the `error` and
 * `message` strings returned by the API.
 *
 * @param siteId {number}	The site to look up
 */
export function* getSite( siteId: number ) {
	yield dispatch( STORE_KEY ).fetchSite();
	try {
		const existingSite: SiteDetails | undefined = yield wpcomRequest( {
			path: '/sites/' + encodeURIComponent( siteId ),
			apiVersion: '1.1',
		} );
		yield dispatch( STORE_KEY ).receiveSite( siteId, existingSite );
	} catch ( err ) {
		yield dispatch( STORE_KEY ).receiveSiteFailed( siteId, undefined );
	}
}

/**
 * Get all site domains
 *
 * @param siteId {number} The site id
 */
export function* getSiteDomains( siteId: number ) {
	try {
		const result: { domains: Domain[] } = yield wpcomRequest( {
			path: '/sites/' + encodeURIComponent( siteId ) + '/domains',
			apiVersion: '1.2',
		} );
		yield dispatch( STORE_KEY ).receiveSiteDomains( siteId, result?.domains );
	} catch ( e ) {}
}

export function* getHappyChatAvailability() {
	const userConfiguration: HappyChatAvailability = yield wpcomRequest( {
		path: '/help/olark/mine',
		apiVersion: '1.1',
	} );
	dispatch( STORE_KEY ).receiveHappyChatAvailability( userConfiguration );
}

export function* getEmailSupportAvailability() {
	const userConfiguration: EmailSupportAvailability = yield wpcomRequest( {
		path: '/help/tickets/kayako/mine',
		apiVersion: '1.1',
	} );
	dispatch( STORE_KEY ).receiveEmailSupportAvailability( userConfiguration );
}

/**
 * Get all site settings
 *
 * @param siteId {number} The site id
 */
export function* getSiteSettings( siteId: number ) {
	try {
		const result: { settings: SiteSettings } = yield wpcomRequest( {
			path: '/sites/' + encodeURIComponent( siteId ) + '/settings',
			apiVersion: '1.4',
		} );
		yield dispatch( STORE_KEY ).receiveSiteSettings( siteId, result?.settings );
	} catch ( e ) {}
}
