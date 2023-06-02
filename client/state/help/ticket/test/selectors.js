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
			expect( isTicketSupportEligible( uninitState ) ).toBe( false );
		} );

		test( 'should return true', () => {
			expect( isTicketSupportEligible( initedState ) ).toBe( true );
		} );
	} );

	describe( '#isTicketSupportConfigurationReady', () => {
		test( 'should return false', () => {
			expect( isTicketSupportConfigurationReady( uninitState ) ).toBe( false );
		} );

		test( 'should return true', () => {
			expect( isTicketSupportConfigurationReady( initedState ) ).toBe( true );
		} );
	} );

	describe( '#isRequestingTicketSupportConfiguration', () => {
		test( 'should return true', () => {
			expect(
				isRequestingTicketSupportConfiguration( {
					help: {
						ticket: {
							isRequesting: true,
						},
					},
				} )
			).toBe( true );
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

			expect( getTicketSupportRequestError( errorState ) ).toEqual( dummyError );
		} );
	} );
} );
