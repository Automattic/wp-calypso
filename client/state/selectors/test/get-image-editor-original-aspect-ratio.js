import getImageEditorOriginalAspectRatio from 'calypso/state/selectors/get-image-editor-original-aspect-ratio';

describe( 'getImageEditorOriginalAspectRatio()', () => {
	test( 'should return null if the image has not loaded yet', () => {
		const originalAspectRatio = getImageEditorOriginalAspectRatio( {
			editor: {
				imageEditor: {
					originalAspectRatio: null,
				},
			},
		} );

		expect( originalAspectRatio ).toBeNull();
	} );

	test( 'should return the original aspect ratio', () => {
		const originalAspectRatio = getImageEditorOriginalAspectRatio( {
			editor: {
				imageEditor: {
					originalAspectRatio: { width: 100, height: 200 },
				},
			},
		} );

		expect( originalAspectRatio ).toEqual( { width: 100, height: 200 } );
	} );
} );
