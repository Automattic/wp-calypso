/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

import {
	TICKET_SUPPORT_CONFIGURATION_REQUEST,
	TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS,
	TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE,
} from 'state/action-types';

export const ticketSupportConfigurationRequest = () => ( dispatch ) => {
	dispatch( { type: TICKET_SUPPORT_CONFIGURATION_REQUEST } );

	return wpcom.undocumented().getKayakoConfiguration()
		.then( ( settings ) => {
			dispatch( ticketSupportConfigurationRequestSuccess( settings );
		} )
		.catch( ( error ) => {
			dispatch( ticketSupportConfigurationRequestFailure( error );
		} );
};

export const ticketSupportConfigurationRequestSuccess = ( settings ) => {
	return {
		type: TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS,
		...settings,
	};
};

export const ticketSupportConfigurationRequestFailure = ( error ) => {
	return {
		type: TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE,
		...error,
	};
};
