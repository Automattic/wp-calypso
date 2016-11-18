/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	ticketSupportConfigurationRequestSuccess,
	ticketSupportConfigurationRequestFailure,
} from '../actions';

import {
	TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS,
	TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE,
} from 'state/action-types';

import { dummyConfiguration, dummyError } from './test-data';

describe( 'ticket-support actions', () => {
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
} );
