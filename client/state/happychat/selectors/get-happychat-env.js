import { get } from 'lodash';

import 'calypso/state/happychat/init';

/**
 * Gets the current happychat chat status
 *
 * @param {Object} state - global redux state
 * @returns {"production"|"staging"} current state value
 */
export default ( state ) => {
	return get( state, 'happychat.connection.env' );
};
