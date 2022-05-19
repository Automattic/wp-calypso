import deepFreeze from 'deep-freeze';
import {
	COUNTRY_STATES_RECEIVE,
	COUNTRY_STATES_REQUEST,
	COUNTRY_STATES_REQUEST_FAILURE,
	COUNTRY_STATES_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { useSandbox } from 'calypso/test-helpers/use-sinon';
import reducer, { items, isFetching } from '../reducer';

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
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'items', 'isFetching' ] )
		);
	} );

	describe( '#statesList()', () => {
		test( 'should default to empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
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

			expect( state.us ).toEqual( originalCountryStates );
		} );

		describe( 'persistence', () => {
			test( 'persists state', () => {
				const original = deepFreeze( { us: originalCountryStates } );
				const state = serialize( items, original );
				expect( state ).toEqual( original );
			} );

			test( 'loads valid persisted state', () => {
				const original = deepFreeze( { us: originalCountryStates } );
				const state = deserialize( items, original );

				expect( state ).toEqual( original );
			} );

			test( 'loads default state when schema does not match', () => {
				const original = deepFreeze( {
					AL: 'Alabama',
					AK: 'Alaska',
					AS: 'American Samoa',
				} );
				const state = deserialize( items, original );
				expect( state ).toEqual( {} );
			} );
		} );
	} );

	describe( '#isFetching()', () => {
		test( 'should default to empty object', () => {
			const state = isFetching( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should be true after a request begins', () => {
			const state = isFetching( false, {
				type: COUNTRY_STATES_REQUEST,
				countryCode: 'us',
			} );
			expect( state.us ).toEqual( true );
		} );

		test( 'should be false when a request completes', () => {
			const state = isFetching( true, {
				type: COUNTRY_STATES_REQUEST_SUCCESS,
				countryCode: 'ca',
			} );
			expect( state.ca ).toEqual( false );
		} );

		test( 'should be false when a request fails', () => {
			const state = isFetching( true, {
				type: COUNTRY_STATES_REQUEST_FAILURE,
				countryCode: 'de',
			} );
			expect( state.de ).toEqual( false );
		} );
	} );
} );
