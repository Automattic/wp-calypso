/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieve a list of G Suite users for a site
 *
 * @param  {Object} state    Global state tree
 * @param  {String} siteId siteId to request G Suite users for
 * @return {Object}        G Suite Users
 */
export default function getGSuiteUsers( state, siteId ) {
	return get( state.gsuiteUsers, [ siteId, 'users' ], null );
}
