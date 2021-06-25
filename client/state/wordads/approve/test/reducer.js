/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { requesting, requestErrors, requestSuccess } from '../reducer';
import {
	WORDADS_SITE_APPROVE_REQUEST,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_DISMISS_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_FAILURE,
	WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'requestErrors',
			'requestSuccess',
		] );
	} );

	describe( '#requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should index requesting state by site ID', () => {
			const siteId = 2916284;
			const state = requesting( undefined, {
				type: WORDADS_SITE_APPROVE_REQUEST,
				siteId,
			} );
			expect( state ).to.eql( {
				2916284: true,
			} );
		} );

		test( 'should accumulate requesting state for sites', () => {
			const original = deepFreeze( {
				2916284: false,
			} );
			const state = requesting( original, {
				type: WORDADS_SITE_APPROVE_REQUEST,
				siteId: 77203074,
			} );
			expect( state ).to.eql( {
				2916284: false,
				77203074: true,
			} );
		} );

		test( 'should override previous requesting state', () => {
			const original = deepFreeze( {
				2916284: true,
				77203074: false,
			} );
			const state = requesting( original, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: false,
			} );
		} );
	} );

	describe( '#requestErrors()', () => {
		test( 'should default to an empty object', () => {
			const state = requestErrors( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should index error state by site ID', () => {
			const state = requestErrors( undefined, {
				type: WORDADS_SITE_APPROVE_REQUEST_FAILURE,
				siteId: 2916284,
				error: 'something went wrong',
			} );

			expect( state ).to.eql( {
				2916284: 'something went wrong',
			} );
		} );

		test( 'should update error state on success', () => {
			const originalState = deepFreeze( {
				2916284: 'something went wrong',
			} );
			const state = requestErrors( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: null,
			} );
		} );

		test( 'should update error state on dismiss error', () => {
			const originalState = deepFreeze( {
				2916284: 'something went wrong',
			} );
			const state = requestErrors( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: null,
			} );
		} );

		test( 'should update error state by site id', () => {
			const originalState = deepFreeze( {
				2916284: 'something went wrong',
			} );
			const state = requestErrors( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_FAILURE,
				siteId: 2916284,
				error: 'whoops',
			} );
			expect( state ).to.eql( {
				2916284: 'whoops',
			} );
		} );

		test( 'should accumulate error state by site ID on failure', () => {
			const originalState = deepFreeze( {
				2916284: 'something went wrong',
			} );
			const state = requestErrors( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_FAILURE,
				siteId: 77203074,
				error: 'something else went wrong',
			} );

			expect( state ).to.eql( {
				2916284: 'something went wrong',
				77203074: 'something else went wrong',
			} );
		} );
	} );

	describe( '#requestSuccess()', () => {
		test( 'should default to an empty object', () => {
			const state = requestSuccess( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should index success state by site ID', () => {
			const state = requestSuccess( undefined, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: true,
			} );
		} );

		test( 'should update success state on error', () => {
			const originalState = deepFreeze( {
				2916284: true,
			} );
			const state = requestSuccess( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_FAILURE,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: null,
			} );
		} );

		test( 'should update success state on dismiss error', () => {
			const originalState = deepFreeze( {
				2916284: true,
			} );
			const state = requestSuccess( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_DISMISS_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: null,
			} );
		} );

		test( 'should update success state by site id', () => {
			const originalState = deepFreeze( {
				2916284: true,
			} );
			const state = requestSuccess( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 2916284,
			} );
			expect( state ).to.eql( {
				2916284: true,
			} );
		} );

		test( 'should accumulate success state by site ID on success', () => {
			const originalState = deepFreeze( {
				2916284: true,
			} );
			const state = requestSuccess( originalState, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: true,
				77203074: true,
			} );
		} );
	} );
} );
