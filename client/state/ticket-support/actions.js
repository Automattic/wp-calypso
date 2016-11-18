/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

import {
	TICKET_SUPPORT_CONFIGURATION_REQUEST,
	TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS,
	TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE,
} from 'state/action-types';

export const ticketSupportConfigurationRequestSuccess = ( configuration ) => {
	return {
		type: TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS,
		...configuration,
	};
};

export const ticketSupportConfigurationRequestFailure = ( error ) => {
	return {
		type: TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE,
		...error,
	};
};

export const ticketSupportConfigurationRequest = () => ( dispatch ) => {
	dispatch( { type: TICKET_SUPPORT_CONFIGURATION_REQUEST } );

	return wpcom.undocumented().getKayakoConfiguration()
		.then( ( configuration ) => {
			dispatch( ticketSupportConfigurationRequestSuccess( configuration ) );
		} )
		.catch( ( error ) => {
			dispatch( ticketSupportConfigurationRequestFailure( error ) );
		} );
};
