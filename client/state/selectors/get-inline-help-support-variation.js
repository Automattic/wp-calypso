import config from '@automattic/calypso-config';
import {
	SUPPORT_CHAT_OVERFLOW,
	SUPPORT_FORUM,
	SUPPORT_HAPPYCHAT,
	SUPPORT_TICKET,
	SUPPORT_UPWORK_TICKET,
} from '@automattic/help-center';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import isHappychatUserEligible from 'calypso/state/happychat/selectors/is-happychat-user-eligible';
import { isTicketSupportEligible } from 'calypso/state/help/ticket/selectors';
import isEligibleForUpworkSupport from 'calypso/state/selectors/is-eligible-for-upwork-support';

/**
 * @param {Object} state Global state tree
 * @returns {string} One of the exported support variation constants listed above
 */
export default function getSupportVariation( state ) {
	if ( isEligibleForUpworkSupport( state ) && isTicketSupportEligible( state ) ) {
		// Upwork-eligible customers are sent to tickets, even if chat is available
		return SUPPORT_UPWORK_TICKET;
	}

	if ( config.isEnabled( 'happychat' ) && isHappychatUserEligible( state ) ) {
		return isHappychatAvailable( state ) ? SUPPORT_HAPPYCHAT : SUPPORT_CHAT_OVERFLOW;
	}

	if ( isTicketSupportEligible( state ) ) {
		return SUPPORT_TICKET;
	}

	return SUPPORT_FORUM;
}
