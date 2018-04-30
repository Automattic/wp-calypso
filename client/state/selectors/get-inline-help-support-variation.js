/** @format */
/**
 * Internal dependencies
 */
import config from 'config';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { isDirectlyFailed } from 'state/selectors';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import isHappychatUserEligible from 'state/happychat/selectors/is-happychat-user-eligible';
import { isTicketSupportEligible } from 'state/help/ticket/selectors';

const SUPPORT_DIRECTLY = 'SUPPORT_DIRECTLY';
const SUPPORT_HAPPYCHAT = 'SUPPORT_HAPPYCHAT';
const SUPPORT_TICKET = 'SUPPORT_TICKET';
const SUPPORT_FORUM = 'SUPPORT_FORUM';

/**
 * @param {Object} state Global state tree
 * @return {String} True if current user is able to see the checklist after checkout
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

	if ( getCurrentUserLocale( state ) === 'en' && isDirectlyFailed( state ) ) {
		return SUPPORT_DIRECTLY;
	}

	return SUPPORT_FORUM;
}
