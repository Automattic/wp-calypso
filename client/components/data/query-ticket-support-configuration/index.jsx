/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { ticketSupportConfigurationRequest } from 'calypso/state/help/ticket/actions';
import { isRequestingTicketSupportConfiguration } from 'calypso/state/help/ticket/selectors';

const request = () => ( dispatch, getState ) => {
	if ( ! isRequestingTicketSupportConfiguration( getState() ) ) {
		dispatch( ticketSupportConfigurationRequest() );
	}
};

export default function QueryTicketSupportConfiguration() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request() );
	}, [ dispatch ] );

	return null;
}
