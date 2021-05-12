/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import isDirectlyReady from 'calypso/state/selectors/is-directly-ready';
import isEligibleForUpworkSupport from 'calypso/state/selectors/is-eligible-for-upwork-support';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import isHappychatUserEligible from 'calypso/state/happychat/selectors/is-happychat-user-eligible';
import { isTicketSupportEligible } from 'calypso/state/help/ticket/selectors';

export const SUPPORT_CHAT_OVERFLOW = 'SUPPORT_CHAT_OVERFLOW';
export const SUPPORT_DIRECTLY = 'SUPPORT_DIRECTLY';
export const SUPPORT_FORUM = 'SUPPORT_FORUM';
export const SUPPORT_HAPPYCHAT = 'SUPPORT_HAPPYCHAT';
export const SUPPORT_TICKET = 'SUPPORT_TICKET';
export const SUPPORT_UPWORK_TICKET = 'SUPPORT_UPWORK_TICKET';

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

	if ( getCurrentUserLocale( state ) === 'en' && isDirectlyReady( state ) ) {
		return SUPPORT_DIRECTLY;
	}

	return SUPPORT_FORUM;
}
