/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns true if we are requesting keyrings for the specified site ID, false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether site keyrings is being requested
 */
export function isRequestingSiteKeyrings( state, siteId ) {
	return get( state.siteKeyrings.requesting, [ siteId ], false );
}

/**
 * Returns true if we are saving keyrings for the specified site ID, false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether site keyrings is being requested
 */
export function isSavingSiteKeyrings( state, siteId ) {
	return get( state.siteKeyrings.saveRequests, [ siteId, 'saving' ], false );
}

/**
 * Returns the status of the last site keyrings save request
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {String|undefined} The request status (pending, success or error) it will return undefined if no requests were issued yet.
 */
export function getSiteKeyringsSaveRequestStatus( state, siteId ) {
	return get( state.siteKeyrings.saveRequests, [ siteId, 'status' ] );
}

/**
 * Returns the keyrings for the specified site ID
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Object}        Site keyrings
 */
export function getSiteKeyrings( state, siteId ) {
	return get( state.siteKeyrings.items, [ siteId ], null );
}
