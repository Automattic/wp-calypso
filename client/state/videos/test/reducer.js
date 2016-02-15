/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	VIDEO_FETCH,
	VIDEO_FETCH_COMPLETED,
	VIDEO_FETCH_FAILED,
	VIDEO_RECEIVE
} from 'state/action-types';
import {
	items,
	fetchingVideo
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

	describe( '#fetchingVideo()', () => {
		it( 'should default to an empty object', () => {
			const state = fetchingVideo( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should map guid to true value if fetching in progress', () => {
			const state = fetchingVideo( undefined, {
				type: VIDEO_FETCH,
				guid: 'kUJmAcSf'
			} );

			expect( state ).to.eql( {
				kUJmAcSf: true
			} );
		} );

		it( 'should accumulate mappings', () => {
			const state = fetchingVideo( deepFreeze( {
				kUJmAcSf: true
			} ), {
				type: VIDEO_FETCH,
				guid: 'aJnoKdwr'
			} );

			expect( state ).to.eql( {
				kUJmAcSf: true,
				aJnoKdwr: true
			} );
		} );

		it( 'should map guid to false value if fetching finishes successfully', () => {
			const state = fetchingVideo( deepFreeze( {
				kUJmAcSf: true
			} ), {
				type: VIDEO_FETCH_COMPLETED,
				guid: 'kUJmAcSf'
			} );

			expect( state ).to.eql( {
				kUJmAcSf: false
			} );
		} );

		it( 'should map guid to false value if fetching finishes with failure', () => {
			const state = fetchingVideo( deepFreeze( {
				kUJmAcSf: true
			} ), {
				type: VIDEO_FETCH_FAILED,
				guid: 'kUJmAcSf'
			} );

			expect( state ).to.eql( {
				kUJmAcSf: false
			} );
		} );
	} );
} );
