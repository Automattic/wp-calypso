import 'calypso/state/hosting/init';

/**
 * Returns Atomic Hosting state
 * @param  {Object}  state   Global state tree
 * @returns {Array} List of SFTP user details
 */
export function getAtomicHosting( state ) {
	return state.atomicHosting ?? null;
}
