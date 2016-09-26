/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	SERIALIZE,
	STATES_LIST_RECEIVE,
	STATES_LIST_REQUEST,
	STATES_LIST_REQUEST_FAILURE,
} from 'state/action-types';
import reducer, {
	statesList,
	isFetching,
} from '../reducer';
import { useSandbox } from 'test/helpers/use-sinon';

const originalStatesList = [
	{ code: 'AL', name: 'Alabama' },
	{ code: 'AK', name: 'Alaska' },
	{ code: 'AS', name: 'American Samoa' },
	{ code: 'AZ', name: 'Arizona' },
	{ code: 'AR', name: 'Arkansas' },
	{ code: 'AA', name: 'Armed Forces America' },
	{ code: 'AE', name: 'Armed Forces Other Areas' },
	{ code: 'AP', name: 'Armed Forces Pacific' },
	{ code: 'CA', name: 'California' },
	{ code: 'CO', name: 'Colorado' }
];

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => sandbox.stub( console, 'warn' ) );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'statesList',
			'isFetching'
		] );
	} );

	describe( '#statesList()', () => {
		it( 'should default to empty object', () => {
			const state = statesList( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should store the states list received', () => {
			const state = statesList( {}, {
				type: STATES_LIST_RECEIVE,
				countryCode: 'US',
				statesList: originalStatesList
			} );

			expect( state.US ).to.eql( originalStatesList );
		} );

		describe( 'persistence', () => {
			it( 'persists state', () => {
				const original = deepFreeze( { US: originalStatesList } ),
					state = statesList( original, { type: SERIALIZE } );
				expect( state ).to.eql( original );
			} );

			it( 'loads valid persisted state', () => {
				const original = deepFreeze( { US: originalStatesList } ),
					state = statesList( original, { type: DESERIALIZE } );

				expect( state ).to.eql( original );
			} );

			it( 'loads default state when schema does not match', () => {
				const original = deepFreeze( {
					AL: 'Alabama',
					AK: 'Alaska',
					AS: 'American Samoa'
				} );
				const state = statesList( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );

	describe( '#isFetching()', () => {
		it( 'should default to false', () => {
			const state = isFetching( undefined, {} );

			expect( state ).to.eql( false );
		} );

		it( 'should be true after a request begins', () => {
			const state = isFetching( false, { type: STATES_LIST_REQUEST } );
			expect( state ).to.eql( true );
		} );

		it( 'should be false when a request completes', () => {
			const state = isFetching( true, { type: STATES_LIST_RECEIVE } );
			expect( state ).to.eql( false );
		} );

		it( 'should be false when a request fails', () => {
			const state = isFetching( true, { type: STATES_LIST_REQUEST_FAILURE } );
			expect( state ).to.eql( false );
		} );

		it( 'should never persist state', () => {
			const state = isFetching( true, { type: SERIALIZE } );

			expect( state ).to.eql( false );
		} );

		it( 'should never load persisted state', () => {
			const state = isFetching( true, { type: DESERIALIZE } );

			expect( state ).to.eql( false );
		} );
	} );
} );
