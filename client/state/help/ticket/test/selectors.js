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
} from '../selectors';

describe( 'ticket-support/configuration/selectors', () => {
	const uninitState = {
		help: {
			ticket: {
				isReady: false,
				isRequesting: false,
				isUserEligible: false,
			},
		},
	};

	const requestingState = {
		help: {
			ticket: {
				isReady: false,
				isRequesting: true,
				isUserEligible: false,
			},
		},
	};

	const initedState = {
		help: {
			ticket: {
				isReady: true,
				isRequesting: false,
				isUserEligible: true,
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
		it( 'should return false', () => {
			assert.isFalse( isRequestingTicketSupportConfiguration( uninitState ) );
		} );

		it( 'should return true', () => {
			assert.isTrue( isRequestingTicketSupportConfiguration( requestingState ) );
		} );
	} );
} );
