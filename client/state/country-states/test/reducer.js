/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { items, isFetching } from '../reducer';
import {
	COUNTRY_STATES_RECEIVE,
	COUNTRY_STATES_REQUEST,
	COUNTRY_STATES_REQUEST_FAILURE,
	COUNTRY_STATES_REQUEST_SUCCESS,
	DESERIALIZE,
	SERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

const originalCountryStates = [
	{ code: 'AL', name: 'Alabama' },
	{ code: 'AK', name: 'Alaska' },
	{ code: 'AS', name: 'American Samoa' },
	{ code: 'AZ', name: 'Arizona' },
	{ code: 'AR', name: 'Arkansas' },
	{ code: 'AA', name: 'Armed Forces America' },
	{ code: 'AE', name: 'Armed Forces Other Areas' },
	{ code: 'AP', name: 'Armed Forces Pacific' },
	{ code: 'CA', name: 'California' },
	{ code: 'CO', name: 'Colorado' },
];

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => sandbox.stub( console, 'warn' ) );

	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'items', 'isFetching' ] );
	} );

	describe( '#statesList()', () => {
		test( 'should default to empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should store the states list received', () => {
			const state = items(
				{},
				{
					type: COUNTRY_STATES_RECEIVE,
					countryCode: 'us',
					countryStates: originalCountryStates,
				}
			);

			expect( state.us ).to.eql( originalCountryStates );
		} );

		describe( 'persistence', () => {
			test( 'persists state', () => {
				const original = deepFreeze( { us: originalCountryStates } ),
					state = items( original, { type: SERIALIZE } );
				expect( state ).to.eql( original );
			} );

			test( 'loads valid persisted state', () => {
				const original = deepFreeze( { us: originalCountryStates } ),
					state = items( original, { type: DESERIALIZE } );

				expect( state ).to.eql( original );
			} );

			test( 'loads default state when schema does not match', () => {
				const original = deepFreeze( {
					AL: 'Alabama',
					AK: 'Alaska',
					AS: 'American Samoa',
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );

	describe( '#isFetching()', () => {
		test( 'should default to empty object', () => {
			const state = isFetching( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should be true after a request begins', () => {
			const state = isFetching( false, {
				type: COUNTRY_STATES_REQUEST,
				countryCode: 'us',
			} );
			expect( state.us ).to.eql( true );
		} );

		test( 'should be false when a request completes', () => {
			const state = isFetching( true, {
				type: COUNTRY_STATES_REQUEST_SUCCESS,
				countryCode: 'ca',
			} );
			expect( state.ca ).to.eql( false );
		} );

		test( 'should be false when a request fails', () => {
			const state = isFetching( true, {
				type: COUNTRY_STATES_REQUEST_FAILURE,
				countryCode: 'de',
			} );
			expect( state.de ).to.eql( false );
		} );

		test( 'should never persist state', () => {
			const state = isFetching( true, { type: SERIALIZE } );

			expect( state ).to.be.undefined;
		} );

		test( 'should never load persisted state', () => {
			const state = isFetching( true, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
