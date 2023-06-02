import { createSelector } from '@automattic/state-utils';
import { filter } from 'lodash';

import 'calypso/state/sharing/init';

/**
 * Returns an array of keyring connection objects.
 *
 * @param  {Object} state Global state tree
 * @returns {Array}        Keyring connections, if known.
 */
export function getKeyringConnections( state ) {
	return Object.values( state.sharing.keyring.items );
}

/**
 * Returns a keyring connection object with a specified ID.
 *
 * @param  {Object} state               Global state tree
 * @param  {number} keyringConnectionId Keyring connection ID.
 * @returns {?Object}                    Keyring connections, if known.
 */
export function getKeyringConnectionById( state, keyringConnectionId ) {
	return state.sharing.keyring.items[ keyringConnectionId ] || null;
}

/**
 * Returns an array of keyring connection objects for a specified service.
 *
 * @param  {Object} state   Global state tree
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
 * @param  {Object} state   Global state tree
 * @param  {string} service Service slug.
 * @returns {Array}         Keyring connections, if known.
 */
export function getBrokenKeyringConnectionsByName( state, service ) {
	return filter( getKeyringConnectionsByName( state, service ), {
		status: 'broken',
	} );
}

/**
 * Returns an array of keyring connection objects for a specified service that
 * need to be manually refreshed/reconnected.
 *
 * @param  {Object} state   Global state tree
 * @param  {string} service Service slug.
 * @returns {Array}         Keyring connections, if any.
 */
export function getRefreshableKeyringConnections( state, service ) {
	return filter(
		getKeyringConnectionsByName( state, service ),
		( conn ) => 'broken' === conn.status || 'refresh-failed' === conn.status
	);
}

/**
 * Returns an array of keyring connection objects for a specific user.
 *
 * @param  {Object} state  Global state tree
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
 * @param  {Object}  state Global state tree
 * @returns {boolean}       Whether a request is in progress
 */
export function isKeyringConnectionsFetching( state ) {
	return state.sharing.keyring.isFetching;
}
