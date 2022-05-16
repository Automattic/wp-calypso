import deepFreeze from 'deep-freeze';
import {
	IMAGE_EDITOR_CROP,
	IMAGE_EDITOR_COMPUTED_CROP,
	IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
	IMAGE_EDITOR_FLIP,
	IMAGE_EDITOR_SET_ASPECT_RATIO,
	IMAGE_EDITOR_SET_DEFAULT_ASPECT_RATIO,
	IMAGE_EDITOR_SET_FILE_INFO,
	IMAGE_EDITOR_SET_CROP_BOUNDS,
	IMAGE_EDITOR_STATE_RESET,
	IMAGE_EDITOR_STATE_RESET_ALL,
	IMAGE_EDITOR_IMAGE_HAS_LOADED,
} from 'calypso/state/action-types';
import { AspectRatios } from '../constants';
import reducer, {
	hasChanges,
	fileInfo,
	transform,
	cropBounds,
	crop,
	aspectRatio,
	imageIsLoading,
	originalAspectRatio,
} from '../reducer';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [
				'hasChanges',
				'fileInfo',
				'transform',
				'cropBounds',
				'crop',
				'aspectRatio',
				'imageIsLoading',
				'originalAspectRatio',
			] )
		);
	} );

	describe( '#hasChanges()', () => {
		test( 'should default to false', () => {
			const state = hasChanges( undefined, {} );

			expect( state ).toBe( false );
		} );

		test( 'should change to true on rotate', () => {
			const state = hasChanges( undefined, {
				type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should change to true on flip', () => {
			const state = hasChanges( undefined, {
				type: IMAGE_EDITOR_FLIP,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should change to true on crop', () => {
			const state = hasChanges( undefined, {
				type: IMAGE_EDITOR_CROP,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should change to true on aspect ratio change', () => {
			const state = hasChanges( undefined, {
				type: IMAGE_EDITOR_SET_ASPECT_RATIO,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should change to false on reset', () => {
			const state = hasChanges( undefined, {
				type: IMAGE_EDITOR_STATE_RESET,
			} );

			expect( state ).toBe( false );
		} );

		test( 'should change to false on reset all', () => {
			const state = hasChanges( undefined, {
				type: IMAGE_EDITOR_STATE_RESET_ALL,
			} );

			expect( state ).toBe( false );
		} );

		test( 'should remain the same on computed crop', () => {
			const init = hasChanges( undefined, {
				type: IMAGE_EDITOR_COMPUTED_CROP,
			} );

			const withChanges = hasChanges( true, {
				type: IMAGE_EDITOR_COMPUTED_CROP,
			} );

			const noChanges = hasChanges( false, {
				type: IMAGE_EDITOR_COMPUTED_CROP,
			} );

			expect( init ).toBe( false );
			expect( withChanges ).toBe( true );
			expect( noChanges ).toBe( false );
		} );

		test( 'should remain the same on default aspect ratio', () => {
			const init = hasChanges( undefined, {
				type: IMAGE_EDITOR_SET_DEFAULT_ASPECT_RATIO,
			} );

			const withChanges = hasChanges( true, {
				type: IMAGE_EDITOR_SET_DEFAULT_ASPECT_RATIO,
			} );

			const noChanges = hasChanges( false, {
				type: IMAGE_EDITOR_SET_DEFAULT_ASPECT_RATIO,
			} );

			expect( init ).toBe( false );
			expect( withChanges ).toBe( true );
			expect( noChanges ).toBe( false );
		} );
	} );

	describe( '#aspectRatio()', () => {
		test( 'should default to free aspect', () => {
			const state = aspectRatio( undefined, {} );

			expect( state ).toEqual( AspectRatios.FREE );
		} );

		test( 'should update the aspect ratio', () => {
			const state = aspectRatio( undefined, {
				type: IMAGE_EDITOR_SET_ASPECT_RATIO,
				ratio: AspectRatios.ORIGINAL,
			} );

			expect( state ).toEqual( AspectRatios.ORIGINAL );
		} );

		test( 'should update the default aspect ratio', () => {
			const state = aspectRatio( undefined, {
				type: IMAGE_EDITOR_SET_DEFAULT_ASPECT_RATIO,
				ratio: AspectRatios.ORIGINAL,
			} );

			expect( state ).toEqual( AspectRatios.ORIGINAL );
		} );

		test( 'should reset to free on reset', () => {
			const state = aspectRatio( undefined, {
				type: IMAGE_EDITOR_STATE_RESET,
			} );

			expect( state ).toEqual( AspectRatios.FREE );
		} );

		test( 'should reset to free on reset all', () => {
			const state = aspectRatio( undefined, {
				type: IMAGE_EDITOR_STATE_RESET_ALL,
			} );

			expect( state ).toEqual( AspectRatios.FREE );
		} );
	} );

	describe( '#cropBounds()', () => {
		test( 'should return defaults initially', () => {
			const state = cropBounds( undefined, {} );

			expect( state ).toEqual( {
				topBound: 0,
				leftBound: 0,
				bottomBound: 100,
				rightBound: 100,
			} );
		} );

		test( 'should update the bounds', () => {
			const state = cropBounds( undefined, {
				type: IMAGE_EDITOR_SET_CROP_BOUNDS,
				topBound: 100,
				leftBound: 200,
				bottomBound: 300,
				rightBound: 400,
			} );

			expect( state ).toEqual( {
				topBound: 100,
				leftBound: 200,
				bottomBound: 300,
				rightBound: 400,
			} );
		} );
	} );

	describe( '#crop()', () => {
		test( 'should return the whole image by default', () => {
			const state = crop( undefined, {} );

			expect( state ).toEqual( {
				topRatio: 0,
				leftRatio: 0,
				widthRatio: 1,
				heightRatio: 1,
			} );
		} );

		test( 'should update the crop ratios', () => {
			const state = crop( undefined, {
				type: IMAGE_EDITOR_CROP,
				topRatio: 0.4,
				leftRatio: 0.5,
				widthRatio: 0.6,
				heightRatio: 0.7,
			} );

			expect( state ).toEqual( {
				topRatio: 0.4,
				leftRatio: 0.5,
				widthRatio: 0.6,
				heightRatio: 0.7,
			} );
		} );

		test( 'should update the computed crop ratios', () => {
			const state = crop( undefined, {
				type: IMAGE_EDITOR_COMPUTED_CROP,
				topRatio: 0.4,
				leftRatio: 0.5,
				widthRatio: 0.6,
				heightRatio: 0.7,
			} );

			expect( state ).toEqual( {
				topRatio: 0.4,
				leftRatio: 0.5,
				widthRatio: 0.6,
				heightRatio: 0.7,
			} );
		} );

		test( 'should update on rotate', () => {
			const state = crop(
				{
					topRatio: 0.4,
					leftRatio: 0.5,
					widthRatio: 0.4,
					heightRatio: 0.7,
				},
				{
					type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
				}
			);

			expect( Object.keys( state ) ).toEqual(
				expect.arrayContaining( [ 'topRatio', 'leftRatio', 'widthRatio', 'heightRatio' ] )
			);

			expect( state.topRatio ).toBeGreaterThanOrEqual( 0.09 );

			expect( state.topRatio ).toBeLessThanOrEqual( 0.11 );
			expect( state.leftRatio ).toBeGreaterThanOrEqual( 0.39 );
			expect( state.leftRatio ).toBeLessThanOrEqual( 0.41 );
			expect( state.widthRatio ).toBeGreaterThanOrEqual( 0.69 );
			expect( state.widthRatio ).toBeLessThanOrEqual( 0.71 );
			expect( state.heightRatio ).toBeGreaterThanOrEqual( 0.39 );
			expect( state.heightRatio ).toBeLessThanOrEqual( 0.41 );
		} );

		test( 'should update on flip', () => {
			const state = crop(
				{
					topRatio: 0.4,
					leftRatio: 0.5,
					widthRatio: 0.4,
					heightRatio: 0.7,
				},
				{
					type: IMAGE_EDITOR_FLIP,
				}
			);

			expect( Object.keys( state ) ).toEqual(
				expect.arrayContaining( [ 'topRatio', 'leftRatio', 'widthRatio', 'heightRatio' ] )
			);

			expect( state.topRatio ).toBeGreaterThanOrEqual( 0.39 );

			expect( state.topRatio ).toBeLessThanOrEqual( 0.41 );
			expect( state.leftRatio ).toBeGreaterThanOrEqual( 0.09 );
			expect( state.leftRatio ).toBeLessThanOrEqual( 0.11 );
			expect( state.widthRatio ).toBeGreaterThanOrEqual( 0.39 );
			expect( state.widthRatio ).toBeLessThanOrEqual( 0.41 );
			expect( state.heightRatio ).toBeGreaterThanOrEqual( 0.69 );
			expect( state.heightRatio ).toBeLessThanOrEqual( 0.71 );
		} );

		test( 'should reset on reset', () => {
			const state = crop( undefined, {
				type: IMAGE_EDITOR_STATE_RESET,
			} );

			expect( state ).toEqual( {
				topRatio: 0,
				leftRatio: 0,
				widthRatio: 1,
				heightRatio: 1,
			} );
		} );

		test( 'should reset on reset all', () => {
			const state = crop( undefined, {
				type: IMAGE_EDITOR_STATE_RESET_ALL,
			} );

			expect( state ).toEqual( {
				topRatio: 0,
				leftRatio: 0,
				widthRatio: 1,
				heightRatio: 1,
			} );
		} );
	} );

	describe( '#fileInfo()', () => {
		test( 'should default to empty source, default file name and type', () => {
			const state = fileInfo( undefined, {} );

			expect( state ).toEqual( {
				src: '',
				fileName: 'default',
				mimeType: 'image/png',
				title: 'default',
			} );
		} );

		test( 'should update the source, file name and mime type', () => {
			const state = fileInfo( undefined, {
				type: IMAGE_EDITOR_SET_FILE_INFO,
				src: 'testSrc',
				fileName: 'testFileName',
				mimeType: 'image/jpg',
				title: 'My Title',
			} );

			expect( state ).toEqual( {
				src: 'testSrc',
				fileName: 'testFileName',
				mimeType: 'image/jpg',
				title: 'My Title',
			} );
		} );

		test( 'should default to empty source, default file name and type on reset all', () => {
			const state = fileInfo( undefined, {
				type: IMAGE_EDITOR_STATE_RESET_ALL,
			} );

			expect( state ).toEqual( {
				src: '',
				fileName: 'default',
				mimeType: 'image/png',
				title: 'default',
			} );
		} );
	} );

	describe( '#transform()', () => {
		test( 'should default to no rotation or scale', () => {
			const state = transform( undefined, {} );

			expect( state ).toEqual( {
				degrees: 0,
				scaleX: 1,
				scaleY: 1,
			} );
		} );

		test( 'should return -90 degrees when rotated counterclockwise from 0 degrees', () => {
			const state = transform(
				{
					degrees: 0,
				},
				{
					type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
				}
			);

			expect( state ).toEqual( {
				degrees: -90,
			} );
		} );

		test( 'should return -180 degrees when rotated counterclockwise from -90 degrees', () => {
			const state = transform(
				{
					degrees: -90,
				},
				{
					type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
				}
			);

			expect( state ).toEqual( {
				degrees: -180,
			} );
		} );

		test( 'should reset the rotation if it is equal to or exceeds (+/-)360 degrees', () => {
			const state = transform(
				{
					degrees: -300,
				},
				{
					type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
				}
			);

			expect( state ).toEqual( {
				degrees: -30,
			} );
		} );

		test( 'should flip scaleX when it is not flipped', () => {
			const state = transform(
				{
					scaleX: 1,
				},
				{
					type: IMAGE_EDITOR_FLIP,
				}
			);

			expect( state ).toEqual( {
				scaleX: -1,
			} );
		} );

		test( 'should flip scaleX when it has been flipped', () => {
			const state = transform(
				{
					scaleX: -1,
				},
				{
					type: IMAGE_EDITOR_FLIP,
				}
			);

			expect( state ).toEqual( {
				scaleX: 1,
			} );
		} );

		test( 'should reset on reset', () => {
			const state = transform(
				{
					degrees: 360,
					scaleX: -1,
					scaleY: 1,
				},
				{
					type: IMAGE_EDITOR_STATE_RESET,
				}
			);

			expect( state ).toEqual( {
				degrees: 0,
				scaleX: 1,
				scaleY: 1,
			} );
		} );

		test( 'should reset on reset all', () => {
			const state = transform(
				{
					degrees: 360,
					scaleX: -1,
					scaleY: 1,
				},
				{
					type: IMAGE_EDITOR_STATE_RESET_ALL,
				}
			);

			expect( state ).toEqual( {
				degrees: 0,
				scaleX: 1,
				scaleY: 1,
			} );
		} );
	} );

	describe( '#imageIsLoading()', () => {
		test( 'should default to true', () => {
			const state = imageIsLoading( undefined, {} );

			expect( state ).toBe( true );
		} );

		test( 'should change to false after image is loaded', () => {
			const state = imageIsLoading( undefined, {
				type: IMAGE_EDITOR_IMAGE_HAS_LOADED,
			} );

			expect( state ).toBe( false );
		} );

		test( 'should change to true on reset all', () => {
			const state = imageIsLoading( undefined, {
				type: IMAGE_EDITOR_STATE_RESET_ALL,
			} );

			expect( state ).toBe( true );
		} );
	} );

	describe( '#originalAspectRatio()', () => {
		test( 'should default to null', () => {
			const state = originalAspectRatio( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should update when an image is loaded', () => {
			const state = originalAspectRatio( undefined, {
				type: IMAGE_EDITOR_IMAGE_HAS_LOADED,
				width: 100,
				height: 200,
			} );

			expect( state ).toEqual( { width: 100, height: 200 } );
		} );

		test( 'should reset to null on reset all', () => {
			const originalState = deepFreeze( { width: 100, height: 100 } );
			const state = originalAspectRatio( originalState, {
				type: IMAGE_EDITOR_STATE_RESET_ALL,
			} );

			expect( state ).toBeNull();
		} );
	} );
} );
