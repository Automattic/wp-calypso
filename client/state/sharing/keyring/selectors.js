import { createSelector } from '@automattic/state-utils';

import 'calypso/state/sharing/init';

/**
 * Returns an array of keyring connection objects.
 * @param  {Object} state Global state tree
 * @returns {Array}        Keyring connections, if known.
 */
export function getKeyringConnections( state ) {
	return Object.values( state.sharing.keyring.items );
}

/**
 * Returns an array of keyring connection objects for a specified service.
 * @param  {Object} state   Global state tree
 * @param  {string} service Service slug.
 * @returns {Array}         Keyring connections, if known.
 */
export const getKeyringConnectionsByName = createSelector(
	( state, service ) =>
		getKeyringConnections( state ).filter( ( connection ) => connection.service === service ),
	( state ) => [ state.sharing.keyring.items ]
);

/**
 * Returns an array of keyring connection objects for a specified service that
 * need to be manually refreshed/reconnected.
 * @param  {Object} state   Global state tree
 * @param  {string} service Service slug.
 * @returns {Array}         Keyring connections, if any.
 */
export function getRefreshableKeyringConnections( state, service ) {
	return getKeyringConnectionsByName( state, service ).filter(
		( conn ) => 'broken' === conn.status || 'refresh-failed' === conn.status
	);
}

/**
 * Returns true if a request is in progress to retrieve keyring services,
 * or false otherwise.
 * @param  {Object}  state Global state tree
 * @returns {boolean}       Whether a request is in progress
 */
export function isKeyringConnectionsFetching( state ) {
	return state.sharing.keyring.isFetching;
}
