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
	imageEditorHasChanges
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getImageEditorTransform()', () => {
		it( 'should return the current image editor transform', () => {
			const transform = getImageEditorTransform( {
				ui: {
					editor: {
						media: {
							imageEditor: {
								transform: {
									degrees: 180,
									scaleX: -1,
									scaleY: 2
								}
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
						media: {
							imageEditor: {
								fileInfo: {
									src: 'testSrc',
									fileName: 'testFileName'
								}
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
						media: {
							imageEditor: {
								hasChanges: true
							}
						}
					}
				}
			} );

			expect( hasChanges ).to.be.true;
		} );
	} );
} );
