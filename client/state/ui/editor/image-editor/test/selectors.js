/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { AspectRatios } from '../constants';
import {
	getImageEditorTransform,
	getImageEditorFileInfo,
	imageEditorHasChanges,
	getImageEditorCropBounds,
	getImageEditorCrop,
	getImageEditorAspectRatio,
	isImageEditorImageLoaded,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getImageEditorTransform()', () => {
		test( 'should return the current image editor transform', () => {
			const transform = getImageEditorTransform( {
				ui: {
					editor: {
						imageEditor: {
							transform: {
								degrees: 180,
								scaleX: -1,
								scaleY: 2,
							},
						},
					},
				},
			} );

			expect( transform ).to.eql( {
				degrees: 180,
				scaleX: -1,
				scaleY: 2,
			} );
		} );
	} );

	describe( '#getImageEditorFileInfo()', () => {
		test( 'should return the information about the current image', () => {
			const fileInfo = getImageEditorFileInfo( {
				ui: {
					editor: {
						imageEditor: {
							fileInfo: {
								src: 'testSrc',
								fileName: 'testFileName',
							},
						},
					},
				},
			} );

			expect( fileInfo ).to.eql( {
				src: 'testSrc',
				fileName: 'testFileName',
			} );
		} );
	} );

	describe( '#imageEditorHasChanges()', () => {
		test( 'should return the editor changed state', () => {
			const hasChanges = imageEditorHasChanges( {
				ui: {
					editor: {
						imageEditor: {
							hasChanges: true,
						},
					},
				},
			} );

			expect( hasChanges ).to.be.true;
		} );
	} );

	describe( '#getImageEditorCropBounds()', () => {
		test( 'should return the crop bounds', () => {
			const bounds = getImageEditorCropBounds( {
				ui: {
					editor: {
						imageEditor: {
							cropBounds: {
								topBound: 100,
								leftBound: 200,
								bottomBound: 300,
								rightBound: 400,
							},
						},
					},
				},
			} );

			expect( bounds ).to.eql( {
				topBound: 100,
				leftBound: 200,
				bottomBound: 300,
				rightBound: 400,
			} );
		} );
	} );

	describe( '#getImageEditorCrop()', () => {
		test( 'should return crop ratios', () => {
			const hasChanges = getImageEditorCrop( {
				ui: {
					editor: {
						imageEditor: {
							crop: {
								topRatio: 0.2,
								leftRatio: 0.3,
								widthRatio: 0.4,
								heightRatio: 0.5,
							},
						},
					},
				},
			} );

			expect( hasChanges ).to.eql( {
				topRatio: 0.2,
				leftRatio: 0.3,
				widthRatio: 0.4,
				heightRatio: 0.5,
			} );
		} );
	} );

	describe( '#getImageEditorAspectRatio()', () => {
		test( 'should return the aspect ratio', () => {
			const hasChanges = getImageEditorAspectRatio( {
				ui: {
					editor: {
						imageEditor: {
							aspectRatio: AspectRatios.FREE,
						},
					},
				},
			} );

			expect( hasChanges ).to.eql( AspectRatios.FREE );
		} );
	} );

	describe( '#isImageEditorImageLoaded()', () => {
		test( 'should return whether the image is loaded or not', () => {
			const imageIsLoading = true;

			const isImageLoaded = isImageEditorImageLoaded( {
				ui: {
					editor: {
						imageEditor: {
							imageIsLoading: imageIsLoading,
						},
					},
				},
			} );

			expect( isImageLoaded ).to.eql( ! imageIsLoading );
		} );
	} );
} );
