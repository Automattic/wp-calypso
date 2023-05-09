import wpcom from 'calypso/lib/wp';
import {
	HELP_TICKET_CONFIGURATION_REQUEST,
	HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
	HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/help/init';

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

	dispatch( requestAction );

	return wpcom.req
		.get( '/help/tickets/kayako/mine' )
		.then( ( configuration ) => {
			dispatch( ticketSupportConfigurationRequestSuccess( configuration ) );
		} )
		.catch( ( error ) => {
			dispatch( ticketSupportConfigurationRequestFailure( error ) );
		} );
};
