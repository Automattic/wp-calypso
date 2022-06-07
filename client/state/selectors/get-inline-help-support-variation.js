import config from '@automattic/calypso-config';
import {
	SUPPORT_CHAT_OVERFLOW,
	SUPPORT_DIRECTLY,
	SUPPORT_FORUM,
	SUPPORT_HAPPYCHAT,
	SUPPORT_TICKET,
	SUPPORT_UPWORK_TICKET,
} from '@automattic/help-center';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import isHappychatUserEligible from 'calypso/state/happychat/selectors/is-happychat-user-eligible';
import { isTicketSupportEligible } from 'calypso/state/help/ticket/selectors';
import isDirectlyReady from 'calypso/state/selectors/is-directly-ready';
import isEligibleForUpworkSupport from 'calypso/state/selectors/is-eligible-for-upwork-support';

/**
 * @param {object} state Global state tree
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

	if (
		config( 'english_locales' ).includes( getCurrentUserLocale( state ) ) &&
		isDirectlyReady( state )
	) {
		return SUPPORT_DIRECTLY;
	}

	return SUPPORT_FORUM;
}
