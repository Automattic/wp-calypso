/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingTicketSupportConfiguration } from '../selectors';

describe( 'ticket-support/is-requesting selectors', () => {
	const testState = {
		ticketSupport: {
			isRequesting: true,
		},
	};

	describe( '#isRequestingTicketSupportConfiguration', () => {
		it( 'should return true', () => {
			assert.isTrue( isRequestingTicketSupportConfiguration( testState ) );
		} );
	} );
} );
