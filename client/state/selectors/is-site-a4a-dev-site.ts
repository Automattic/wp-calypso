import { AppState } from 'calypso/types';
import getRawSite from './get-raw-site';

/**
 * Returns true if site is an Automattic for Agencies dev site, false otherwise.
 * @param  {Object}   state  Global state tree
 * @param  {number | null}   siteId Site ID
 * @returns {boolean}        Whether site is an A4A dev site or not
 */
export default function isSiteA4ADevSite( state: AppState, siteId: number | null ) {
	if ( ! siteId ) {
		return false;
	}
	const site = getRawSite( state, siteId );
	return site?.is_a4a_dev_site ?? false;
}
