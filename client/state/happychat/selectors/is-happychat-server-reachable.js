/** @format **/

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { HAPPYCHAT_CONNECTION_ERROR_PING_TIMEOUT } from 'state/happychat/constants';

export default createSelector(
	state => state.happychat.connection.error !== HAPPYCHAT_CONNECTION_ERROR_PING_TIMEOUT
);
