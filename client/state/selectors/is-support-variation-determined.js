/**
 * Internal Dependencies
 */
import config from '@automattic/calypso-config';

// State Selectors
import {
	isTicketSupportConfigurationReady,
	getTicketSupportRequestError,
} from 'calypso/state/help/ticket/selectors';
import isHappychatUserEligible from 'calypso/state/happychat/selectors/is-happychat-user-eligible';
import isDirectlyFailed from 'calypso/state/selectors/is-directly-failed';
import isDirectlyReady from 'calypso/state/selectors/is-directly-ready';
import isDirectlyUninitialized from 'calypso/state/selectors/is-directly-uninitialized';
import getHappychatConnectionStatus from 'calypso/state/happychat/selectors/get-happychat-connection-status';

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

	const directlyIsReadyOrFailed =
		isDirectlyFailed( state ) || isDirectlyUninitialized( state ) || isDirectlyReady( state );

	return ticketReadyOrError && happychatReadyOrDisabled && directlyIsReadyOrFailed;
}
