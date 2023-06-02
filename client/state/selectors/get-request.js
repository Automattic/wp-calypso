import { getRequestKey } from 'calypso/state/data-layer/wpcom-http/utils';

/**
 * Returns meta information about data requests going through the data layer
 *
 * @param {Object} state Redux state
 * @param {Object} action data request action
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
