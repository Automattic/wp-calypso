/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	WORDADS_SITE_APPROVE_REQUEST,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_DISMISS_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_FAILURE,
	WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, {
	requesting,
	requestErrors,
	requestSuccess
} from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'requestErrors',
			'requestSuccess'
		] );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should index requesting state by site ID', () => {
			const siteId = 2916284;
			const state = requesting( undefined, {
				type: WORDADS_SITE_APPROVE_REQUEST,
				siteId
			} );
			expect( state ).to.eql( {
				2916284: true
			} );
		} );

		it( 'should accumulate requesting state for sites', () => {
			const original = deepFreeze( {
				2916284: false
			} );
			const state = requesting( original, {
				type: WORDADS_SITE_APPROVE_REQUEST,
				siteId: 77203074
			} );
			expect( state ).to.eql( {
				2916284: false,
				77203074: true
			} );
		} );

		it( 'should override previous requesting state', () => {
			const original = deepFreeze( {
				2916284: true,
				77203074: false
			} );
			const state = requesting( original, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: false
			} );
		} );

		describe( 'persistence', () => {
			it( 'never persists state', () => {
				const original = deepFreeze( {
					2916284: false,
					77203074: true
				} );
				const state = requesting( original, { type: SERIALIZE } );
				expect( state ).to.eql( {} );
			} );

			it( 'never loads persisted state', () => {
				const original = deepFreeze( {
					2916284: false,
					77203074: true
				} );
				const state = requesting( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );

	describe( '#requestErrors()', () => {
		it( 'should default to an empty object', () => {
			const state = requestErrors( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should index error state by site ID', () => {
			const state = requestErrors( undefined, {
				type: WORDADS_SITE_APPROVE_REQUEST_FAILURE,
				siteId: 2916284,
				error: 'something went wrong'
			} );

			expect( state ).to.eql( {
				2916284: 'something went wrong'
			} );
		} );

		it( 'should update error state on success', () => {
			const originalState = deepFreeze( {
				2916284: 'something went wrong'
			} );
			const state = requestErrors( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: null
			} );
		} );

		it( 'should update error state on dismiss error', () => {
			const originalState = deepFreeze( {
				2916284: 'something went wrong'
			} );
			const state = requestErrors( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: null
			} );
		} );

		it( 'should update error state by site id', () => {
			const originalState = deepFreeze( {
				2916284: 'something went wrong'
			} );
			const state = requestErrors( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_FAILURE,
				siteId: 2916284,
				error: 'whoops'
			} );
			expect( state ).to.eql( {
				2916284: 'whoops'
			} );
		} );

		it( 'should accumulate error state by site ID on failure', () => {
			const originalState = deepFreeze( {
				2916284: 'something went wrong'
			} );
			const state = requestErrors( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_FAILURE,
				siteId: 77203074,
				error: 'something else went wrong'
			} );

			expect( state ).to.eql( {
				2916284: 'something went wrong',
				77203074: 'something else went wrong'
			} );
		} );

		describe( 'persistence', () => {
			it( 'never persists state', () => {
				const original = deepFreeze( {
					2916284: 'so many requestErrors',
					77203074: null
				} );
				const state = requestErrors( original, { type: SERIALIZE } );
				expect( state ).to.eql( {} );
			} );

			it( 'never loads persisted state', () => {
				const original = deepFreeze( {
					2916284: null,
					77203074: 'something went wrong'
				} );
				const state = requestErrors( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );

	describe( '#requestSuccess()', () => {
		it( 'should default to an empty object', () => {
			const state = requestSuccess( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should index success state by site ID', () => {
			const state = requestSuccess( undefined, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: true
			} );
		} );

		it( 'should update success state on error', () => {
			const originalState = deepFreeze( {
				2916284: true
			} );
			const state = requestSuccess( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_FAILURE,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: null
			} );
		} );

		it( 'should update success state on dismiss error', () => {
			const originalState = deepFreeze( {
				2916284: true
			} );
			const state = requestSuccess( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_DISMISS_SUCCESS,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: null
			} );
		} );

		it( 'should update success state by site id', () => {
			const originalState = deepFreeze( {
				2916284: true
			} );
			const state = requestSuccess( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 2916284
			} );
			expect( state ).to.eql( {
				2916284: true
			} );
		} );

		it( 'should accumulate success state by site ID on success', () => {
			const originalState = deepFreeze( {
				2916284: true
			} );
			const state = requestSuccess( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 77203074
			} );

			expect( state ).to.eql( {
				2916284: true,
				77203074: true
			} );
		} );

		describe( 'persistence', () => {
			it( 'never persists state', () => {
				const original = deepFreeze( {
					2916284: true,
					77203074: null
				} );
				const state = requestSuccess( original, { type: SERIALIZE } );
				expect( state ).to.eql( {} );
			} );

			it( 'never loads persisted state', () => {
				const original = deepFreeze( {
					2916284: null,
					77203074: true
				} );
				const state = requestSuccess( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );
} );
