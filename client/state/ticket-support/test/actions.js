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
} from '../actions';

import {
	TICKET_SUPPORT_CONFIGURATION_REQUEST,
	TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS,
	TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE,
} from 'state/action-types';

import { dummyConfiguration, dummyError } from './test-data';

import { useNock } from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'ticket-support actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	describe( '#ticketSupportConfigurationRequestSuccess', () => {
		it( 'should return TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS', () => {
			const action = ticketSupportConfigurationRequestSuccess( dummyConfiguration );

			assert.deepEqual( action, {
				type: TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS,
				...dummyConfiguration,
			} );
		} );
	} );

	describe( '#ticketSupportConfigurationRequestFailure', () => {
		it( 'should return TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE', () => {
			const action = ticketSupportConfigurationRequestFailure( dummyError );

			assert.deepEqual( action, {
				type: TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE,
				...dummyError,
			} );
		} );
	} );

	const apiUrl = 'https://public-api.wordpress.com:443';
	const endpoint = '/rest/v1.1/help/tickets/kayako/mine';

	describe( '#ticketSupportConfigurationRequest success', () => {
		useNock( ( nock ) => {
			nock( apiUrl )
				.get( endpoint )
				.reply( 200, dummyConfiguration );
		} );

		it( 'should be successful.', () => {
			const action = ticketSupportConfigurationRequest()( spy );

			assert( spy.calledWith( { type: TICKET_SUPPORT_CONFIGURATION_REQUEST } ) );

			action.then( () => {
				assert( spy.calledWith( {
					type: TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS,
					...dummyConfiguration,
				} ) );
			} );
		} );
	} );

	describe( '#ticketSupportConfigurationRequest failed', () => {
		useNock( ( nock ) => {
			nock( apiUrl )
				.get( endpoint )
				.reply( dummyError.status, dummyError );
		} );

		it( 'should be failed.', () => {
			const action = ticketSupportConfigurationRequest()( spy );

			assert( spy.calledWith( { type: TICKET_SUPPORT_CONFIGURATION_REQUEST } ) );

			action.then( () => {
				assert( spy.calledWith( sinon.match( {
					type: TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE,
					...dummyError,
				} ) ) );
			} );
		} );
	} );
} );
