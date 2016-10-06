/**
 * Returns an object of service objects or null if there are no Keyring services.
 *
 * @param  {Object} state Global state tree
 * @return {Object}       Keyring services, if known.
 */
export function getKeyringServices( state ) {
	return state.sharing.services.items;
}

/**
 * Returns true if a request is in progress to retrieve keyring services,
 * or false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether a request is in progress
 */
export function isKeyringServicesFetching( state ) {
	return state.sharing.services.isFetching;
}
