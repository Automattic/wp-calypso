/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRawSite from 'state/selectors/get-raw-site';

/**
 * Returns the updates object for a site
 * @param {object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {object} Available updates for the site
 */
export default function getUpdatesBySiteId( state, siteId ) {
	return get( getRawSite( state, siteId ), 'updates', null );
}
