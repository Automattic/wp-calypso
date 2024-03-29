import shouldShowVideoEditorError from 'calypso/state/selectors/should-show-video-editor-error';

describe( 'shouldShowVideoEditorError()', () => {
	test( 'should return the poster error state', () => {
		const showError = shouldShowVideoEditorError( {
			editor: {
				videoEditor: {
					showError: true,
				},
			},
		} );

		expect( showError ).toBe( true );
	} );
} );
