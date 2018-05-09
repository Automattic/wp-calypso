/** @format */
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
import { isDirectlyReady, isDirectlyFailed } from 'state/selectors';
import getHappychatConnectionStatus from 'state/happychat/selectors/get-happychat-connection-status';

/**
 * @param {Object} state Global state tree
 * @return {Boolean} Have each of the required async checks been made?
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
