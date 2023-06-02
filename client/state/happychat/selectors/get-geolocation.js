import { get } from 'lodash';

import 'calypso/state/happychat/init';

/**
 * Returns the geo location of the current user, based happychat session initiation (on ip)
 *
 * @param {Object}  state  Global state tree
 * @returns {?string}        Current user geo location
 */
export default ( state ) => get( state, 'happychat.user.geoLocation', null );
