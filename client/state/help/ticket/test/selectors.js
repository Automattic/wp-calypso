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
	hasRequestError,
} from '../selectors';

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

	describe( '#hasRequestError', () => {
		it( 'should return true', () => {
			assert.isTrue( hasRequestError( {
				help: {
					ticket: {
						requestError: true,
					},
				},
			} ) );
		} );
	} );
} );
