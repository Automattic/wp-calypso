/**
 * External dependencies
 */

import { filter, values } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Returns an array of keyring connection objects.
 *
 * @param  {object} state Global state tree
 * @returns {Array}        Keyring connections, if known.
 */
export function getKeyringConnections( state ) {
	return values( state.sharing.keyring.items );
}

/**
 * Returns a keyring connection object with a specified ID.
 *
 * @param  {object} state               Global state tree
 * @param  {number} keyringConnectionId Keyring connection ID.
 * @returns {?object}                    Keyring connections, if known.
 */
export function getKeyringConnectionById( state, keyringConnectionId ) {
	return state.sharing.keyring.items[ keyringConnectionId ] || null;
}

/**
 * Returns an array of keyring connection objects for a specified service.
 *
 * @param  {object} state   Global state tree
 * @param  {string} service Service slug.
 * @returns {Array}         Keyring connections, if known.
 */
export const getKeyringConnectionsByName = createSelector(
	( state, service ) => filter( getKeyringConnections( state ), { service } ),
	( state ) => [ state.sharing.keyring.items ]
);

/**
 * Returns an array of broken keyring connection objects for a specified service.
 *
 * @param  {object} state   Global state tree
 * @param  {string} service Service slug.
 * @returns {Array}         Keyring connections, if known.
 */
export function getBrokenKeyringConnectionsByName( state, service ) {
	return filter( getKeyringConnectionsByName( state, service ), {
		status: 'broken',
	} );
}

/**
 * Returns an array of keyring connection objects for a specific user.
 *
 * @param  {object} state  Global state tree
 * @param  {number} userId User ID.
 * @returns {Array}         Site connections, if known.
 */
export function getUserConnections( state, userId ) {
	return filter(
		state.sharing.keyring.items,
		( connection ) => connection.shared || connection.keyring_connection_user_ID === userId
	);
}

/**
 * Returns true if a request is in progress to retrieve keyring services,
 * or false otherwise.
 *
 * @param  {object}  state Global state tree
 * @returns {boolean}       Whether a request is in progress
 */
export function isKeyringConnectionsFetching( state ) {
	return state.sharing.keyring.isFetching;
}
