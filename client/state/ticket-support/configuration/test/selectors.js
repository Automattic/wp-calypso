/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	defaultConfiguration,
	getTicketSupportConfiguration,
	isTicketSupportEligible,
	isTicketSupportConfigurationReady,
} from '../selectors';

describe( 'ticket-support/configuration/selectors', () => {
	const uninitState = {
		ticketSupport: {
			configuration: null,
		},
	};

	const initState = {
		ticketSupport: {
			configuration: {
				isUserEligible: true,
			},
		},
	};

	describe( '#getTicketSupportConfiguration', () => {
		it( 'should return the default one', () => {
			const configuration = getTicketSupportConfiguration( uninitState );

			assert.deepEqual( configuration, defaultConfiguration );
		} );

		it( 'should return ticketSupport.configuration', () => {
			const configuration = getTicketSupportConfiguration( initState );
			assert.deepEqual( configuration, initState.ticketSupport.configuration );
		} );
	} );

	describe( '#isTicketSupportEligible', () => {
		it( 'should default to false', () => {
			const eligible = isTicketSupportEligible( uninitState );
			assert.isFalse( eligible );
		} );

		it( 'should return true', () => {
			const eligible = isTicketSupportEligible( initState );

			assert.isTrue( eligible );
		} );
	} );

	describe( '#isTicketSupportConfigurationReady', () => {
		it( 'should return false', () => {
			const ready = isTicketSupportConfigurationReady( uninitState );

			assert.isFalse( ready );
		} );

		it( 'should return true', () => {
			const ready = isTicketSupportConfigurationReady( initState );

			assert.isTrue( ready );
		} );
	} );
} );
