/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { requesting, geo } from '../reducer';
import {
	GEO_RECEIVE,
	GEO_REQUEST,
	GEO_REQUEST_FAILURE,
	GEO_REQUEST_SUCCESS,
	DESERIALIZE,
} from 'client/state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( sandbox => sandbox.stub( console, 'warn' ) );

	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'requesting', 'geo' ] );
	} );

	describe( 'requesting()', () => {
		test( 'should default to false', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.be.false;
		} );

		test( 'should set site ID to true value if request in progress', () => {
			const state = requesting( undefined, {
				type: GEO_REQUEST,
			} );

			expect( state ).to.eql( true );
		} );

		test( 'should set site ID to false if request succeeds', () => {
			const state = requesting( true, {
				type: GEO_REQUEST_SUCCESS,
			} );

			expect( state ).to.eql( false );
		} );

		test( 'should set site ID to false if request fails', () => {
			const state = requesting( true, {
				type: GEO_REQUEST_FAILURE,
			} );

			expect( state ).to.eql( false );
		} );
	} );

	describe( 'geo()', () => {
		test( 'should default to null', () => {
			const state = geo( undefined, {} );

			expect( state ).to.be.null;
		} );

		test( 'should track received geo data', () => {
			const state = geo( undefined, {
				type: GEO_RECEIVE,
				geo: {
					latitude: '39.36006',
					longitude: '-84.30994',
					country_short: 'US',
					country_long: 'United States',
					region: 'Ohio',
					city: 'Mason',
				},
			} );

			expect( state ).to.eql( {
				latitude: '39.36006',
				longitude: '-84.30994',
				country_short: 'US',
				country_long: 'United States',
				region: 'Ohio',
				city: 'Mason',
			} );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				latitude: '39.36006',
				longitude: '-84.30994',
				country_short: 'US',
				country_long: 'United States',
				region: 'Ohio',
				city: 'Mason',
			} );
			const state = geo( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {
				latitude: '39.36006',
				longitude: '-84.30994',
				country_short: 'US',
				country_long: 'United States',
				region: 'Ohio',
				city: 'Mason',
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				country_short: true,
			} );
			const state = geo( original, { type: DESERIALIZE } );

			expect( state ).to.be.null;
		} );
	} );
} );
