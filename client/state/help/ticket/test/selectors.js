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
		it( 'should default to false', () => {
			assert.isFalse( isTicketSupportEligible( uninitState ) );
		} );

		it( 'should return true', () => {
			assert.isTrue( isTicketSupportEligible( initedState ) );
		} );
	} );

	describe( '#isTicketSupportConfigurationReady', () => {
		it( 'should return false', () => {
			assert.isFalse( isTicketSupportConfigurationReady( uninitState ) );
		} );

		it( 'should return true', () => {
			assert.isTrue( isTicketSupportConfigurationReady( initedState ) );
		} );
	} );

	describe( '#isRequestingTicketSupportConfiguration', () => {
		it( 'should return true', () => {
			assert.isTrue( isRequestingTicketSupportConfiguration( {
				help: {
					ticket: {
						isRequesting: true,
					},
				},
			} ) );
		} );
	} );

	describe( '#getTicketSupportRequestError', () => {
		it( 'should return the error object', () => {
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
