/**
 * External dependencies
 *
 * @format
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { HAPPYCHAT_CHAT_STATUS_ASSIGNED } from 'state/happychat/constants';
import createSelector from 'lib/create-selector';

export default createSelector(
	state => get( state, 'happychat.chat.status' ) === HAPPYCHAT_CHAT_STATUS_ASSIGNED
);
