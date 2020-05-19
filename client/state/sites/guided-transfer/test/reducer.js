/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { status, isFetching, isSaving } from '../reducer';
import {
	DESERIALIZE,
	GUIDED_TRANSFER_HOST_DETAILS_SAVE,
	GUIDED_TRANSFER_HOST_DETAILS_SAVE_FAILURE,
	GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS,
	GUIDED_TRANSFER_STATUS_RECEIVE,
	GUIDED_TRANSFER_STATUS_REQUEST,
	GUIDED_TRANSFER_STATUS_REQUEST_FAILURE,
	GUIDED_TRANSFER_STATUS_REQUEST_SUCCESS,
	SERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	const testSiteId = 100658273;

	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'error',
			'status',
			'isFetching',
			'isSaving',
		] );
	} );

	describe( '#status()', () => {
		test( 'should default to {}', () => {
			const state = status( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should store the status received', () => {
			const guidedTransferStatus = deepFreeze( {
				upgrade_purchased: true,
				host_details_entered: false,
			} );

			const state = status(
				{},
				{
					type: GUIDED_TRANSFER_STATUS_RECEIVE,
					siteId: testSiteId,
					guidedTransferStatus,
				}
			);

			expect( state[ testSiteId ] ).to.eql( guidedTransferStatus );
		} );

		describe( 'persistence', () => {
			test( 'persists state', () => {
				const original = deepFreeze( {
					[ testSiteId ]: {
						upgrade_purchased: true,
						host_details_entered: false,
					},
				} );
				const state = status( original, { type: SERIALIZE } );
				expect( state ).to.eql( original );
			} );

			test( 'loads valid persisted state', () => {
				const original = deepFreeze( {
					[ testSiteId ]: {
						upgrade_purchased: true,
						host_details_entered: false,
					},
				} );
				const state = status( original, { type: DESERIALIZE } );
				expect( state ).to.eql( original );
			} );

			test( 'loads default state when schema does not match', () => {
				const original = deepFreeze( {
					invalid_id: {
						upgrade_purchased: true,
						host_details_entered: false,
					},
				} );
				const state = status( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );

	describe( '#isFetching()', () => {
		test( 'should default to {}', () => {
			const state = isFetching( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should be true after a request begins', () => {
			const state = isFetching( false, {
				type: GUIDED_TRANSFER_STATUS_REQUEST,
				siteId: testSiteId,
			} );
			expect( state[ testSiteId ] ).to.be.true;
		} );

		test( 'should be false when a request completes', () => {
			const state = isFetching( true, {
				type: GUIDED_TRANSFER_STATUS_REQUEST_SUCCESS,
				siteId: testSiteId,
			} );
			expect( state[ testSiteId ] ).to.be.false;
		} );

		test( 'should be false when a request fails', () => {
			const state = isFetching( true, {
				type: GUIDED_TRANSFER_STATUS_REQUEST_FAILURE,
				siteId: testSiteId,
			} );
			expect( state[ testSiteId ] ).to.be.false;
		} );

		test( 'should never persist state', () => {
			const state = isFetching(
				{
					[ testSiteId ]: true,
				},
				{ type: SERIALIZE }
			);

			expect( state ).to.be.undefined;
		} );

		test( 'should never load persisted state', () => {
			const state = isFetching(
				{
					[ testSiteId ]: true,
				},
				{ type: DESERIALIZE }
			);

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#isSaving()', () => {
		test( 'should default to {}', () => {
			const state = isSaving( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should be true after a request begins', () => {
			const state = isSaving( false, {
				type: GUIDED_TRANSFER_HOST_DETAILS_SAVE,
				siteId: testSiteId,
			} );
			expect( state[ testSiteId ] ).to.be.true;
		} );

		test( 'should be false when a request completes', () => {
			const state = isSaving( true, {
				type: GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS,
				siteId: testSiteId,
			} );
			expect( state[ testSiteId ] ).to.be.false;
		} );

		test( 'should be false when a request fails', () => {
			const state = isSaving( true, {
				type: GUIDED_TRANSFER_HOST_DETAILS_SAVE_FAILURE,
				siteId: testSiteId,
			} );
			expect( state[ testSiteId ] ).to.be.false;
		} );
	} );
} );
