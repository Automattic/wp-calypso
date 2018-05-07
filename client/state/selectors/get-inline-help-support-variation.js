/** @format */
/**
 * Internal dependencies
 */
import config from 'config';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { isDirectlyReady } from 'state/selectors';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import isHappychatUserEligible from 'state/happychat/selectors/is-happychat-user-eligible';
import { isTicketSupportEligible } from 'state/help/ticket/selectors';

export const SUPPORT_DIRECTLY = 'SUPPORT_DIRECTLY';
export const SUPPORT_HAPPYCHAT = 'SUPPORT_HAPPYCHAT';
export const SUPPORT_TICKET = 'SUPPORT_TICKET';
export const SUPPORT_FORUM = 'SUPPORT_FORUM';

/**
 * @param {Object} state Global state tree
 * @return {String} One of the exported support variation constants listed above
 */
export default function getSupportVariation( state ) {
	if (
		config.isEnabled( 'happychat' ) &&
		isHappychatAvailable( state ) &&
		isHappychatUserEligible( state )
	) {
		return SUPPORT_HAPPYCHAT;
	}

	if ( isTicketSupportEligible( state ) ) {
		return SUPPORT_TICKET;
	}

	if ( getCurrentUserLocale( state ) === 'en' && isDirectlyReady( state ) ) {
		return SUPPORT_DIRECTLY;
	}

	return SUPPORT_FORUM;
}
