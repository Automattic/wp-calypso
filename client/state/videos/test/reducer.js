/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	VIDEO_REQUEST,
	VIDEO_REQUEST_SUCCESS,
	VIDEO_REQUEST_FAILURE,
	VIDEO_RECEIVE
} from 'state/action-types';
import {
	items,
	videoRequests
} from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should accumulate videos', () => {
			const original = deepFreeze( {
				kUJmAcSf: { title: 'VideoPress Demo', width: 1920, height: 1080 }
			} );
			const state = items( original, {
				type: VIDEO_RECEIVE,
				guid: 'aJnoKdwr',
				data: { title: 'Pocahontas', width: 720, height: 576 }
			} );

			expect( state ).to.eql( {
				kUJmAcSf: { title: 'VideoPress Demo', width: 1920, height: 1080 },
				aJnoKdwr: { title: 'Pocahontas', width: 720, height: 576 }
			} );
		} );

		it( 'should override previous video of same guid', () => {
			const original = deepFreeze( {
				kUJmAcSf: { title: 'VideoPress Demo', width: 1920, height: 1080 }
			} );
			const state = items( original, {
				guid: 'kUJmAcSf',
				type: VIDEO_RECEIVE,
				data: { title: 'Updated VideoPress Demo', width: 1920, height: 1080 }
			} );

			expect( state ).to.eql( {
				kUJmAcSf: { title: 'Updated VideoPress Demo', width: 1920, height: 1080 }
			} );
		} );
	} );

	describe( '#videoRequests()', () => {
		it( 'should default to an empty object', () => {
			const state = videoRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should map guid to true value if a request is in progress for that guid', () => {
			const state = videoRequests( undefined, {
				type: VIDEO_REQUEST,
				guid: 'kUJmAcSf'
			} );

			expect( state ).to.eql( {
				kUJmAcSf: true
			} );
		} );

		it( 'should accumulate mappings', () => {
			const state = videoRequests( deepFreeze( {
				kUJmAcSf: true
			} ), {
				type: VIDEO_REQUEST,
				guid: 'aJnoKdwr'
			} );

			expect( state ).to.eql( {
				kUJmAcSf: true,
				aJnoKdwr: true
			} );
		} );

		it( 'should map guid to false value if a request for that guid finishes successfully', () => {
			const state = videoRequests( deepFreeze( {
				kUJmAcSf: true
			} ), {
				type: VIDEO_REQUEST_SUCCESS,
				guid: 'kUJmAcSf'
			} );

			expect( state ).to.eql( {
				kUJmAcSf: false
			} );
		} );

		it( 'should map guid to false value if a request for that guid finishes with failure', () => {
			const state = videoRequests( deepFreeze( {
				kUJmAcSf: true
			} ), {
				type: VIDEO_REQUEST_FAILURE,
				guid: 'kUJmAcSf'
			} );

			expect( state ).to.eql( {
				kUJmAcSf: false
			} );
		} );
	} );
} );
