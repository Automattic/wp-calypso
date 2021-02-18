/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/happychat/init';

/**
 * Returns if precancellation chat is available.
 *
 * @param   {object}  state  Global state tree
 * @returns {boolean}        true, when precancellation is available
 */
export default function isPrecancellationChatAvailable( state ) {
	return get( state, 'happychat.user.isPresalesPrecancellationEligible.precancellation', false );
}
