/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { items, isFetching, error } from '../reducer';
import {
	I18N_LANGUAGE_NAMES_REQUEST,
	I18N_LANGUAGE_NAMES_REQUEST_SUCCESS,
	I18N_LANGUAGE_NAMES_REQUEST_FAILURE,
} from 'state/action-types';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'items', 'isFetching', 'error' ] );
	} );

	describe( '#items()', () => {
		test( 'should default to empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should update with items', () => {
			const state = items( undefined, {
				type: I18N_LANGUAGE_NAMES_REQUEST_SUCCESS,
				items: { neil: 'down' },
			} );

			expect( state ).to.eql( { neil: 'down' } );
		} );
	} );

	describe( '#error()', () => {
		test( 'should default to null', () => {
			const state = error( undefined, {} );
			expect( state ).to.eql( null );
		} );

		test( 'should update with error', () => {
			const state = error( undefined, {
				type: I18N_LANGUAGE_NAMES_REQUEST_FAILURE,
				error: 'oh no!',
			} );

			expect( state ).to.eql( 'oh no!' );
		} );

		test( 'should return null when request is successful', () => {
			const state = error( undefined, {
				type: I18N_LANGUAGE_NAMES_REQUEST_SUCCESS,
			} );

			expect( state ).to.eql( null );
		} );
	} );

	describe( '#isFetching()', () => {
		test( 'should default to false', () => {
			const state = isFetching( undefined, {} );
			expect( state ).to.be.false;
		} );

		test( 'should return true when requesting', () => {
			const state = isFetching( undefined, {
				type: I18N_LANGUAGE_NAMES_REQUEST,
			} );

			expect( state ).to.be.true;
		} );

		test( 'should return false when request is successful', () => {
			const state = isFetching( undefined, {
				type: I18N_LANGUAGE_NAMES_REQUEST_SUCCESS,
			} );

			expect( state ).to.be.false;
		} );

		test( 'should return false when request fails', () => {
			const state = isFetching( undefined, {
				type: I18N_LANGUAGE_NAMES_REQUEST_FAILURE,
			} );
			expect( state ).to.be.false;
		} );
	} );
} );
