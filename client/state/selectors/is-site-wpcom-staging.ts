import { AppState } from 'calypso/types';
import getRawSite from './get-raw-site';

/**
 * Returns true if site is a Staging site, false otherwise.
 * @param  {Object}   state  Global state tree
 * @param  {number | null}   siteId Site ID
 * @returns {boolean}        Whether site is a staging site or not
 */
export default function isSiteWpcomStaging( state: AppState, siteId: number | null ) {
	if ( ! siteId ) {
		return false;
	}
	const site = getRawSite( state, siteId );
	return site?.is_wpcom_staging_site ?? false;
}
