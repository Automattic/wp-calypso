/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getImageEditorTransform,
	getImageEditorFileInfo,
	imageEditorHasChanges,
	getImageEditorAspectRatio
} from '../selectors';
import { AspectRatios } from '../constants';

describe( 'selectors', () => {
	describe( '#getImageEditorTransform()', () => {
		it( 'should return the current image editor transform', () => {
			const transform = getImageEditorTransform( {
				ui: {
					editor: {
						imageEditor: {
							transform: {
								degrees: 180,
								scaleX: -1,
								scaleY: 2
							}
						}
					}
				}
			} );

			expect( transform ).to.eql( {
				degrees: 180,
				scaleX: -1,
				scaleY: 2
			} );
		} );
	} );

	describe( '#getImageEditorFileInfo()', () => {
		it( 'should return the information about the current image', () => {
			const fileInfo = getImageEditorFileInfo( {
				ui: {
					editor: {
						imageEditor: {
							fileInfo: {
								src: 'testSrc',
								fileName: 'testFileName'
							}
						}
					}
				}
			} );

			expect( fileInfo ).to.eql( {
				src: 'testSrc',
				fileName: 'testFileName'
			} );
		} );
	} );

	describe( '#imageEditorHasChanges()', () => {
		it( 'should return the editor changed state', () => {
			const hasChanges = imageEditorHasChanges( {
				ui: {
					editor: {
						imageEditor: {
							hasChanges: true
						}
					}
				}
			} );

			expect( hasChanges ).to.be.true;
		} );
	} );

	describe( '#getImageEditorAspectRatio()', () => {
		it( 'should return the aspect ratio', () => {
			const hasChanges = getImageEditorAspectRatio( {
				ui: {
					editor: {
						imageEditor: {
							aspectRatio: AspectRatios.FREE
						}
					}
				}
			} );

			expect( hasChanges ).to.eql( AspectRatios.FREE );
		} );
	} );
} );
