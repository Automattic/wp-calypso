/** @format */

/**
 * External dependencies
 */
import { get, values } from 'lodash';

/**
 * Retrieve a list of G Suite users for a site
 *
 * @param  {Object} state    Global state tree
 * @param  {String} siteId siteId to request G Suite users for
 * @return {Object}        G Suite Users
 */
export default function getGSuiteUsers( state, siteId ) {
	const gsuiteUsersObject = get( state.gsuiteUsers, [ siteId, 'gsuiteUsers' ], null );
	return gsuiteUsersObject ? values( gsuiteUsersObject ) : null;
}
