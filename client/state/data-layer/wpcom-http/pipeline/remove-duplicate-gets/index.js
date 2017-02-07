/**
 * Prevent sending multiple identical GET requests
 * while one is still transiting over the network
 *
 * Note! This doesn't do anything yet
 *
 * @module state/data-layer/wpcom-http/optimizations/remove-duplicate-gets
 */

export const removeDuplicateGets = ( { action, dispatch } ) => {
	return { action, dispatch };
};

export default removeDuplicateGets;
