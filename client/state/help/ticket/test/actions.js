/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	ticketSupportConfigurationRequest,
	ticketSupportConfigurationRequestSuccess,
	ticketSupportConfigurationRequestFailure,
	ticketSupportConfigurationDismissError,
} from '../actions';
import { dummyConfiguration, dummyError } from './test-data';
import {
	HELP_TICKET_CONFIGURATION_REQUEST,
	HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
	HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
	HELP_TICKET_CONFIGURATION_DISMISS_ERROR,
} from 'state/action-types';
import { useNock } from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'ticket-support/configuration actions', () => {
	let spy;
	useSandbox( ( sandbox ) => ( spy = sandbox.spy() ) );

	describe( '#ticketSupportConfigurationRequestSuccess', () => {
		test( 'should return HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS', () => {
			const action = ticketSupportConfigurationRequestSuccess( dummyConfiguration );

			assert.deepEqual( action, {
				type: HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
				configuration: dummyConfiguration,
			} );
		} );
	} );

	describe( '#ticketSupportConfigurationRequestFailure', () => {
		test( 'should return HELP_TICKET_CONFIGURATION_REQUEST_FAILURE', () => {
			const action = ticketSupportConfigurationRequestFailure( dummyError );

			assert.deepEqual( action, {
				type: HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
				error: dummyError,
			} );
		} );
	} );

	const apiUrl = 'https://public-api.wordpress.com:443';
	const endpoint = '/rest/v1.1/help/tickets/kayako/mine';

	describe( '#ticketSupportConfigurationRequest success', () => {
		useNock( ( nock ) => {
			nock( apiUrl ).get( endpoint ).reply( 200, dummyConfiguration );
		} );

		test( 'should be successful.', () => {
			const action = ticketSupportConfigurationRequest()( spy );

			assert( spy.calledWith( sinon.match( { type: HELP_TICKET_CONFIGURATION_REQUEST } ) ) );

			action.then( () => {
				assert(
					spy.calledWith( {
						type: HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
						configuration: dummyConfiguration,
					} )
				);
			} );
		} );
	} );

	describe( '#ticketSupportConfigurationRequest failed', () => {
		useNock( ( nock ) => {
			nock( apiUrl ).get( endpoint ).reply( dummyError.status, dummyError );
		} );

		test( 'should be failed.', () => {
			const action = ticketSupportConfigurationRequest()( spy );

			assert( spy.calledWith( sinon.match( { type: HELP_TICKET_CONFIGURATION_REQUEST } ) ) );

			action.then( () => {
				assert(
					spy.calledWith(
						sinon.match( {
							type: HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
							error: dummyError,
						} )
					)
				);
			} );
		} );
	} );

	describe( '#ticketSupportConfigurationDismissError', () => {
		test( 'should return HELP_TICKET_CONFIGURATION_DISMISS_ERROR', () => {
			const action = ticketSupportConfigurationDismissError();

			assert.deepEqual( action, {
				type: HELP_TICKET_CONFIGURATION_DISMISS_ERROR,
			} );
		} );
	} );
} );
