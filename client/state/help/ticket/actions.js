/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	HELP_TICKET_CONFIGURATION_REQUEST,
	HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
	HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
	HELP_TICKET_CONFIGURATION_DISMISS_ERROR,
} from 'state/action-types';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';

export const ticketSupportConfigurationRequestSuccess = ( configuration ) => {
	return {
		type: HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
		configuration,
	};
};

export const ticketSupportConfigurationRequestFailure = ( error ) => {
	return {
		type: HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
		error,
	};
};

export const ticketSupportConfigurationRequest = () => ( dispatch ) => {
	const requestAction = {
		type: HELP_TICKET_CONFIGURATION_REQUEST,
	};

	dispatch(
		withAnalytics(
			recordTracksEvent( 'calypso_ticket_support_configuration_requested' ),
			requestAction
		)
	);

	return wpcom
		.undocumented()
		.getKayakoConfiguration()
		.then( ( configuration ) => {
			dispatch( ticketSupportConfigurationRequestSuccess( configuration ) );
		} )
		.catch( ( error ) => {
			dispatch( ticketSupportConfigurationRequestFailure( error ) );
		} );
};

export const ticketSupportConfigurationDismissError = () => {
	return { type: HELP_TICKET_CONFIGURATION_DISMISS_ERROR };
};
