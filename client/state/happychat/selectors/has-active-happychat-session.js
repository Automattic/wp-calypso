/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_CHAT_STATUS_BLOCKED,
	HAPPYCHAT_CHAT_STATUS_CLOSED,
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
	HAPPYCHAT_CHAT_STATUS_NEW,
} from 'calypso/state/happychat/constants';
import createSelector from 'calypso/lib/create-selector';

import 'calypso/state/happychat/init';

/**
 * Returns true if there's an active chat session in-progress. Chat sessions with
 * the status `new`, `default`, or `closed` are considered inactive, as the session
 * is not connected to an operator.
 *
 * @param {object} state - global redux state
 * @returns {boolean} Whether there's an active Happychat session happening
 */
export default createSelector(
	( state ) =>
		! includes(
			[
				HAPPYCHAT_CHAT_STATUS_BLOCKED,
				HAPPYCHAT_CHAT_STATUS_CLOSED,
				HAPPYCHAT_CHAT_STATUS_DEFAULT,
				HAPPYCHAT_CHAT_STATUS_NEW,
			],
			state.happychat.chat.status
		),
	( state ) => state.happychat.chat.status
);
