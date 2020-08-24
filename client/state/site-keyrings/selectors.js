/**
 * External dependencies
 */

import { get, filter, find } from 'lodash';

/**
 * Returns true if we are requesting keyrings for the specified site ID, false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether site keyrings is being requested
 */
export function isRequestingSiteKeyrings( state, siteId ) {
	return get( state.siteKeyrings.requesting, [ siteId ], false );
}

/**
 * Returns true if we are saving keyrings for the specified site ID, false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether site keyrings is being requested
 */
export function isSavingSiteKeyrings( state, siteId ) {
	return get( state.siteKeyrings.saveRequests, [ siteId, 'saving' ], false );
}

/**
 * Returns the status of the last site keyrings save request
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {string|undefined} The request status (pending, success or error) it will return undefined if no requests were issued yet.
 */
export function getSiteKeyringsSaveRequestStatus( state, siteId ) {
	return get( state.siteKeyrings.saveRequests, [ siteId, 'status' ] );
}

/**
 * Returns the keyrings for the specified site ID
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {object}  Site keyrings indexed by keyring ids
 */
export function getSiteKeyrings( state, siteId ) {
	return get( state.siteKeyrings.items, [ siteId ], [] );
}

/**
 * Returns the keyrings for the specified site ID and service
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {string}  service The service name to filter with
 * @returns {Array}   Site keyrings list
 */
export function getSiteKeyringsForService( state, siteId, service ) {
	return filter( getSiteKeyrings( state, siteId ), { service } );
}

/**
 * Returns the matching site keyring connection or undefined if it does not exist.
 *
 * @param  {object}  state          Global state tree
 * @param  {number}  siteId         Site ID
 * @param  {number}  keyringId      Keyring Id
 * @param  {string}  externalUserId External User Id on the keyring
 *
 * @returns {?object}                Site Keyring connection
 */
export function getSiteKeyringConnection( state, siteId, keyringId, externalUserId = null ) {
	return find( getSiteKeyrings( state, siteId ), ( siteKeyring ) => {
		return externalUserId === null
			? siteKeyring.keyring_id === keyringId
			: siteKeyring.keyring_id === keyringId && siteKeyring.external_user_id === externalUserId;
	} );
}
