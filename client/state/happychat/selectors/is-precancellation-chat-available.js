import { get } from 'lodash';

import 'calypso/state/happychat/init';

/**
 * Returns if precancellation chat is available.
 *
 * @param   {Object}  state  Global state tree
 * @returns {boolean}        true, when precancellation is available
 */
export default function isPrecancellationChatAvailable( state ) {
	return get( state, 'happychat.user.availability.precancellation', false );
}
