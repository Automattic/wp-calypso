/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
	IMAGE_EDITOR_FLIP,
	IMAGE_EDITOR_SET_FILE_INFO,
	IMAGE_EDITOR_STATE_RESET
} from 'state/action-types';

import reducer, { hasChanges, fileInfo, transform } from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'hasChanges',
			'fileInfo',
			'transform'
		] );
	} );

	describe( '#hasChanges()', () => {
		it( 'should default to false', () => {
			const state = hasChanges( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should change to true on rotate', () => {
			const state = hasChanges( undefined, {
				type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to true on flip', () => {
			const state = hasChanges( undefined, {
				type: IMAGE_EDITOR_FLIP
			} );

			expect( state ).to.be.true;
		} );

		it( 'should change to false on reset', () => {
			const state = hasChanges( undefined, {
				type: IMAGE_EDITOR_STATE_RESET
			} );

			expect( state ).to.be.false;
		} );
	} );

	describe( '#fileInfo()', () => {
		it( 'should default to empty source, default file name and type', () => {
			const state = fileInfo( undefined, {} );

			expect( state ).to.eql( {
				src: '',
				fileName: 'default',
				mimeType: 'image/png'
			} );
		} );

		it( 'should update the source, file name and mime type', () => {
			const state = fileInfo( undefined, {
				type: IMAGE_EDITOR_SET_FILE_INFO,
				src: 'testSrc',
				fileName: 'testFileName',
				mimeType: 'image/jpg'
			} );

			expect( state ).to.eql( {
				src: 'testSrc',
				fileName: 'testFileName',
				mimeType: 'image/jpg'
			} );
		} );
	} );

	describe( '#transform()', () => {
		it( 'should default to no rotation or scale', () => {
			const state = transform( undefined, {} );

			expect( state ).to.eql( {
				degrees: 0,
				scaleX: 1,
				scaleY: 1
			} );
		} );

		it( 'should return -90 degrees when rotated counterclockwise from 0 degrees', () => {
			const state = transform( {
				degrees: 0
			}, {
				type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE
			} );

			expect( state ).to.eql( {
				degrees: -90
			} );
		} );

		it( 'should return -180 degrees when rotated counterclockwise from -90 degrees', () => {
			const state = transform( {
				degrees: -90
			}, {
				type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE
			} );

			expect( state ).to.eql( {
				degrees: -180
			} );
		} );

		it( 'should reset the rotation if it is equal to or exceeds (+/-)360 degrees', () => {
			const state = transform( {
				degrees: -300
			}, {
				type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE
			} );

			expect( state ).to.eql( {
				degrees: -30
			} );
		} );

		it( 'should flip scaleX when it is not flipped', () => {
			const state = transform( {
				scaleX: 1
			}, {
				type: IMAGE_EDITOR_FLIP
			} );

			expect( state ).to.eql( {
				scaleX: -1
			} );
		} );

		it( 'should flip scaleX when it has been flipped', () => {
			const state = transform( {
				scaleX: -1
			}, {
				type: IMAGE_EDITOR_FLIP
			} );

			expect( state ).to.eql( {
				scaleX: 1
			} );
		} );

		it( 'should reset', () => {
			const state = transform( {
				degrees: 360,
				scaleX: -1,
				scaleY: 1
			}, {
				type: IMAGE_EDITOR_STATE_RESET
			} );

			expect( state ).to.eql( {
				degrees: 0,
				scaleX: 1,
				scaleY: 1
			} );
		} );
	} );
} );
