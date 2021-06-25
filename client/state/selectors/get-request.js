/**
 * Internal dependencies
 */
import { getRequestKey } from 'calypso/state/data-layer/wpcom-http/utils';

/**
 * Returns meta information about data requests going through the data layer
 *
 * @param {object} state Redux state
 * @param {object} action data request action
 * @returns {*} metadata about request
 */
export default ( state, action ) => {
	const data = state?.dataRequests?.[ getRequestKey( action ) ] ?? {};

	return {
		...data,
		hasLoaded: data.lastUpdated > -Infinity,
		isLoading: data.status === 'pending',
	};
};
