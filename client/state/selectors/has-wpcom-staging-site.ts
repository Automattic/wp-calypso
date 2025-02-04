import { AppState } from 'calypso/types';
import getRawSite from './get-raw-site';

/**
 * Returns true if the site has a staging site, false otherwise.
 * @param  {Object}   state  Global state tree
 * @param  {number | null}   siteId Site ID
 * @returns {boolean}        Whether site has a staging site or note
 */
export default function hasWpcomStagingSite( state: AppState, siteId: number | null ) {
	if ( ! siteId ) {
		return false;
	}
	const site = getRawSite( state, siteId );
	return site?.options?.wpcom_staging_blog_ids?.length ?? false;
}
