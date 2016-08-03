/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	GUIDED_TRANSFER_STATUS_RECEIVE,
	GUIDED_TRANSFER_STATUS_REQUEST,
	GUIDED_TRANSFER_STATUS_REQUEST_FAILURE,
	GUIDED_TRANSFER_STATUS_REQUEST_SUCCESS,
	SERIALIZE,
} from 'state/action-types';
import reducer, {
	status,
	isFetching,
} from '../reducer';

describe( 'reducer', () => {
	const testSiteId = 100658273;

	before( () => {
		sinon.stub( console, 'warn' );
	} );

	after( () => {
		console.warn.restore();
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'status',
			'isFetching'
		] );
	} );

	describe( '#status()', () => {
		it( 'should default to {}', () => {
			const state = status( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should store the status received', () => {
			const guidedTransferStatus = deepFreeze( {
				upgrade_purchased: true,
				host_details_entered: false,
			} );

			const state = status( {}, {
				type: GUIDED_TRANSFER_STATUS_RECEIVE,
				siteId: testSiteId,
				guidedTransferStatus,
			} );

			expect( state[ testSiteId ] ).to.eql( guidedTransferStatus );
		} );

		describe( 'persistence', () => {
			it( 'persists state', () => {
				const original = deepFreeze( {
					[ testSiteId ]: {
						upgrade_purchased: true,
						host_details_entered: false,
					}
				} );
				const state = status( original, { type: SERIALIZE } );
				expect( state ).to.eql( original );
			} );

			it( 'loads valid persisted state', () => {
				const original = deepFreeze( {
					[ testSiteId ]: {
						upgrade_purchased: true,
						host_details_entered: false,
					}
				} );
				const state = status( original, { type: DESERIALIZE } );
				expect( state ).to.eql( original );
			} );

			it( 'loads default state when schema does not match', () => {
				const original = deepFreeze( {
					invalid_id: {
						upgrade_purchased: true,
						host_details_entered: false,
					}
				} );
				const state = status( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );

	describe( '#isFetching()', () => {
		it( 'should default to {}', () => {
			const state = isFetching( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should be true after a request begins', () => {
			const state = isFetching( false, {
				type: GUIDED_TRANSFER_STATUS_REQUEST,
				siteId: testSiteId
			} );
			expect( state[ testSiteId ] ).to.be.true;
		} );

		it( 'should be false when a request completes', () => {
			const state = isFetching( true, {
				type: GUIDED_TRANSFER_STATUS_REQUEST_SUCCESS,
				siteId: testSiteId,
			} );
			expect( state[ testSiteId ] ).to.be.false;
		} );

		it( 'should be false when a request fails', () => {
			const state = isFetching( true, {
				type: GUIDED_TRANSFER_STATUS_REQUEST_FAILURE,
				siteId: testSiteId
			} );
			expect( state[ testSiteId ] ).to.be.false;
		} );

		it( 'should never persist state', () => {
			const state = isFetching( {
				[ testSiteId ]: true,
			}, { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should never load persisted state', () => {
			const state = isFetching( {
				[ testSiteId ]: true,
			}, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
