import config from '@automattic/calypso-config';
import getHappychatConnectionStatus from 'calypso/state/happychat/selectors/get-happychat-connection-status';
import isHappychatUserEligible from 'calypso/state/happychat/selectors/is-happychat-user-eligible';
import {
	isTicketSupportConfigurationReady,
	getTicketSupportRequestError,
} from 'calypso/state/help/ticket/selectors';

/**
 * @param {Object} state Global state tree
 * @returns {boolean} Have each of the required async checks been made?
 */
export default function isSupportVariationDetermined( state ) {
	const ticketReadyOrError =
		isTicketSupportConfigurationReady( state ) || getTicketSupportRequestError( state ) !== null;

	const isHappyChatConnecting = getHappychatConnectionStatus( state ) === 'connecting';
	const happychatReadyOrDisabled =
		! config.isEnabled( 'happychat' ) ||
		! isHappychatUserEligible( state ) ||
		! isHappyChatConnecting;

	return ticketReadyOrError && happychatReadyOrDisabled;
}
