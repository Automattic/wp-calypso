jest.mock( 'store', () => require( './mocks/store' ) );

/**
 * External dependencies
 */
import { expect } from 'chai';
import store from 'store';

/**
 * Internal dependencies
 */

import {
	deleteOldTicket,
	GUEST_TICKET_LOCALFORAGE_KEY,
	injectGuestSandboxTicketHandler
} from '../guest-sandbox-ticket';

describe( 'guest-sandbox-ticket', () => {
	beforeEach( () => {
		store.clear();
	} );

	describe( '#deleteOldTicket', () => {
		it( 'should remove tickets older than two hours', () => {
			store.set( GUEST_TICKET_LOCALFORAGE_KEY, {
				value: 'foo',
				createdDate: Date.now() - 1000 * 60 * 60 * 3 // three hours in the past
			} );

			deleteOldTicket();

			expect( store.get( GUEST_TICKET_LOCALFORAGE_KEY ) ).to.be.undefined;
		} );

		it( 'should not remove tickets younger than two hours', () => {
			const ticket = {
				value: 'foo',
				createdDate: Date.now() - 1000 * 60 * 60 * 1 // one hour in the past
			};

			store.set( GUEST_TICKET_LOCALFORAGE_KEY, ticket );

			deleteOldTicket();

			expect( store.get( GUEST_TICKET_LOCALFORAGE_KEY ) ).to.equal( ticket );
		} );
	} );

	describe( '#injectGuestSandboxTicketHandler', () => {
		it( 'should update `wpcom` to add the ticket param if present', ( done ) => {
			const ticket = {
				value: 'foo',
				createdDate: Date.now() - 1000 * 60 * 60 * 1 // one hour in the past
			};

			store.set( GUEST_TICKET_LOCALFORAGE_KEY, ticket );

			const wpcom = {
				request( params ) {
					expect( params.query ).to.equal( 'search=whatever&store_sandbox_ticket=foo' );
					done();
				}
			};

			injectGuestSandboxTicketHandler( wpcom );

			expect( wpcom.request( { query: 'search=whatever' } ) );
		} );

		it( 'should not add ticket param if it is not present', ( done ) => {
			const wpcom = {
				request( params ) {
					expect( params.query ).to.equal( 'search=whatever' );
					done();
				}
			};

			injectGuestSandboxTicketHandler( wpcom );

			expect( wpcom.request( { query: 'search=whatever' } ) );
		} );
	} );
} );
