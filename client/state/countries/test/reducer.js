/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	COUNTRIES_RECEIVE,
	COUNTRIES_REQUEST,
	COUNTRIES_REQUEST_FAILURE,
	COUNTRIES_REQUEST_SUCCESS,
	DESERIALIZE,
	SERIALIZE,
} from 'state/action-types';
import reducer, {
	items,
	isRequesting,
} from '../reducer';
import { listTypes } from '../constants';
import { useSandbox } from 'test/helpers/use-sinon';

const originalCountries = [
		{ code: 'US', name: 'United States' },
		{ code: 'IN', name: 'India' }
	],
	{ DOMAIN, PAYMENT, SMS } = listTypes;

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => sandbox.stub( console, 'warn' ) );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'items',
			'isRequesting'
		] );
	} );

	describe( '.items', () => {
		[ DOMAIN, PAYMENT, SMS ].forEach( ( listType ) => {
			describe( `.${ listType }`, () => {
				it( 'should default to empty array', () => {
					const state = items( undefined, {} )[ listType ];

					expect( state ).to.eql( [] );
				} );

				it( 'should store the countries received', () => {
					const original = deepFreeze( items( undefined, {} ) );
					const state = items( original, {
						type: COUNTRIES_RECEIVE,
						listType,
						countries: originalCountries
					} );

					expect( state[ listType ] ).to.eql( originalCountries );
				} );
			} );
		} );

		describe( 'persistence', () => {
			it( 'should persist state', () => {
				const original = deepFreeze( { [ DOMAIN ]: originalCountries, [ SMS ]: [], [ PAYMENT ]: [] } ),
					state = items( original, { type: SERIALIZE } );
				expect( state ).to.eql( original );
			} );

			it( 'should load valid persisted state', () => {
				const original = deepFreeze( { [ DOMAIN ]: originalCountries, [ SMS ]: [], [ PAYMENT ]: [] } ),
					state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( original );
			} );

			it( 'should load default state when schema does not match', () => {
				const original = deepFreeze( {
					[ DOMAIN ]: [ { code: 'US' } ], [ SMS ]: [], [ PAYMENT ]: []
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {
					[ DOMAIN ]: [], [ SMS ]: [], [ PAYMENT ]: []
				} );
			} );
		} );
	} );

	describe( '.isRequesting', () => {
		[ DOMAIN, PAYMENT, SMS ].forEach( ( listType ) => {
			describe( `.${ listType }`, () => {
				it( 'should default to false', () => {
					expect( isRequesting( undefined, {} )[ listType ] ).to.eql( false );
				} );
				it( 'should be true after a request begins', () => {
					const original = deepFreeze( isRequesting( undefined, {} ) );
					const state = isRequesting( original, {
						type: COUNTRIES_REQUEST,
						listType
					} );
					expect( state[ listType ] ).to.eql( true );
				} );

				[
					COUNTRIES_REQUEST_FAILURE,
					COUNTRIES_REQUEST_SUCCESS,
					SERIALIZE,
					DESERIALIZE
				].forEach( ( actionType ) => {
					it( `should be false when on ${ actionType }`, () => {
						const original = deepFreeze( {
							[ DOMAIN ]: true, [ SMS ]: true, [ PAYMENT ]: true
						} );
						const state = isRequesting( original, {
							type: actionType,
							listType
						} );
						expect( state[ listType ] ).to.eql( false );
					} );
				} );
			} );
		} );
	} );
} );
