/**
 * Internal Dependencies
 */
import config from 'config';

// State Selectors
import {
	isTicketSupportConfigurationReady,
	getTicketSupportRequestError,
} from 'state/help/ticket/selectors';
import isHappychatUserEligible from 'state/happychat/selectors/is-happychat-user-eligible';
import isDirectlyFailed from 'state/selectors/is-directly-failed';
import isDirectlyReady from 'state/selectors/is-directly-ready';
import getHappychatConnectionStatus from 'state/happychat/selectors/get-happychat-connection-status';

/**
 * @param {object} state Global state tree
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

	const directlyIsReadyOrFailed = isDirectlyFailed( state ) || isDirectlyReady( state );

	return ticketReadyOrError && happychatReadyOrDisabled && directlyIsReadyOrFailed;
}
