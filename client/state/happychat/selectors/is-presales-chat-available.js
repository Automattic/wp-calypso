import { get } from 'lodash';

import 'calypso/state/happychat/init';

/**
 * Returns if presales chat is available.
 *
 * @param   {object}  state  Global state tree
 * @returns {boolean}        true, when presales is available
 */
export default function isPresalesChatAvailable( state ) {
	return get( state, 'happychat.user.isPresalesPrecancellationEligible.presale', false );
}
