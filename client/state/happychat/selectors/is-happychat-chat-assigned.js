/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { HAPPYCHAT_CHAT_STATUS_ASSIGNED } from 'calypso/state/happychat/constants';

import 'calypso/state/happychat/init';

export default ( state ) =>
	get( state, 'happychat.chat.status' ) === HAPPYCHAT_CHAT_STATUS_ASSIGNED;
