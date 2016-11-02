/**
 * External dependencies
 */
import { filter, values } from 'lodash';

/**
 * Returns an array of keyring connection objects.
 *
 * @param  {Object} state Global state tree
 * @return {Array}        Keyring connections, if known.
 */
export function getKeyringConnections( state ) {
	return values( state.sharing.keyring.items );
}

/**
 * Returns a keyring connection object with a specified ID.
 *
 * @param  {Object} state               Global state tree
 * @param  {Number} keyringConnectionId Keyring connection ID.
 * @return {?Object}                    Keyring connections, if known.
 */
export function getKeyringConnectionById( state, keyringConnectionId ) {
	return state.sharing.keyring.items[ keyringConnectionId ] || null;
}

/**
 * Returns an array of keyring connection objects for a specified service.
 *
 * @param  {Object} state   Global state tree
 * @param  {String} service Service slug.
 * @return {Array}         Keyring connections, if known.
 */
export function getKeyringConnectionsByName( state, service ) {
	return filter( getKeyringConnections( state ), { service } );
}

/**
 * Returns an array of keyring connection objects for a specific user.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} userId User ID.
 * @return {Array}         Site connections, if known.
 */
export function getUserConnections( state, userId ) {
	return filter( state.sharing.keyring.items, ( connection ) => (
		connection.shared || connection.keyring_connection_user_ID === userId
	) );
}

/**
 * Returns true if a request is in progress to retrieve keyring services,
 * or false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether a request is in progress
 */
export function isKeyringConnectionsFetching( state ) {
	return state.sharing.keyring.isFetching;
}
