/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 *
 * @param  {Object} state  Global state tree
 * @param  {String} siteId the siteId to get domains for
 * @return {Boolean} If the request is in progress
 */
export default function isRequestingGSuiteUsers( state, siteId ) {
	return get( state.gsuiteUsers, [ siteId, 'requesting' ], false );
}
