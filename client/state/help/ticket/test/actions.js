import {
	HELP_TICKET_CONFIGURATION_REQUEST,
	HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
	HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { useNock } from 'calypso/test-helpers/use-nock';
import {
	ticketSupportConfigurationRequest,
	ticketSupportConfigurationRequestSuccess,
	ticketSupportConfigurationRequestFailure,
} from '../actions';
import { dummyConfiguration, dummyError } from './test-data';

describe( 'ticket-support/configuration actions', () => {
	describe( '#ticketSupportConfigurationRequestSuccess', () => {
		test( 'should return HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS', () => {
			const action = ticketSupportConfigurationRequestSuccess( dummyConfiguration );

			expect( action ).toEqual( {
				type: HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
				configuration: dummyConfiguration,
			} );
		} );
	} );

	describe( '#ticketSupportConfigurationRequestFailure', () => {
		test( 'should return HELP_TICKET_CONFIGURATION_REQUEST_FAILURE', () => {
			const action = ticketSupportConfigurationRequestFailure( dummyError );

			expect( action ).toEqual( {
				type: HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
				error: dummyError,
			} );
		} );
	} );

	const apiUrl = 'https://public-api.wordpress.com:443';
	const endpoint = '/rest/v1.1/help/tickets/zendesk/mine';

	describe( '#ticketSupportConfigurationRequest success', () => {
		const spy = jest.fn();

		useNock( ( nock ) => {
			nock( apiUrl ).get( endpoint ).reply( 200, dummyConfiguration );
		} );

		test( 'should be successful.', () => {
			const action = ticketSupportConfigurationRequest()( spy );

			expect( spy ).toHaveBeenCalledWith(
				expect.objectContaining( { type: HELP_TICKET_CONFIGURATION_REQUEST } )
			);

			return action.then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
					configuration: dummyConfiguration,
				} );
			} );
		} );
	} );

	describe( '#ticketSupportConfigurationRequest failed', () => {
		const spy = jest.fn();

		useNock( ( nock ) => {
			nock( apiUrl ).get( endpoint ).reply( dummyError.status, dummyError );
		} );

		test( 'should be failed.', () => {
			const action = ticketSupportConfigurationRequest()( spy );

			expect( spy ).toHaveBeenCalledWith(
				expect.objectContaining( { type: HELP_TICKET_CONFIGURATION_REQUEST } )
			);

			return action.then( () => {
				expect( spy ).toHaveBeenCalledWith(
					expect.objectContaining( {
						type: HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
						error: expect.objectContaining( dummyError ),
					} )
				);
			} );
		} );
	} );
} );
