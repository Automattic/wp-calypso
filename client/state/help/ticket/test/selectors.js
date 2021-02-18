/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	isTicketSupportEligible,
	isTicketSupportConfigurationReady,
	isRequestingTicketSupportConfiguration,
	getTicketSupportRequestError,
} from '../selectors';
import { dummyError } from './test-data';

describe( 'ticket-support/configuration/selectors', () => {
	const uninitState = {
		help: {
			ticket: {
				isReady: false,
				isRequesting: false,
				isUserEligible: false,
				requestError: false,
			},
		},
	};

	const initedState = {
		help: {
			ticket: {
				isReady: true,
				isRequesting: false,
				isUserEligible: true,
				requestError: false,
			},
		},
	};

	describe( '#isTicketSupportEligible', () => {
		test( 'should default to false', () => {
			assert.isFalse( isTicketSupportEligible( uninitState ) );
		} );

		test( 'should return true', () => {
			assert.isTrue( isTicketSupportEligible( initedState ) );
		} );
	} );

	describe( '#isTicketSupportConfigurationReady', () => {
		test( 'should return false', () => {
			assert.isFalse( isTicketSupportConfigurationReady( uninitState ) );
		} );

		test( 'should return true', () => {
			assert.isTrue( isTicketSupportConfigurationReady( initedState ) );
		} );
	} );

	describe( '#isRequestingTicketSupportConfiguration', () => {
		test( 'should return true', () => {
			assert.isTrue(
				isRequestingTicketSupportConfiguration( {
					help: {
						ticket: {
							isRequesting: true,
						},
					},
				} )
			);
		} );
	} );

	describe( '#getTicketSupportRequestError', () => {
		test( 'should return the error object', () => {
			const errorState = {
				help: {
					ticket: {
						requestError: dummyError,
					},
				},
			};

			assert.deepEqual( getTicketSupportRequestError( errorState ), dummyError );
		} );
	} );
} );
