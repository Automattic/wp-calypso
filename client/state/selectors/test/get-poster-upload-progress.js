import getPosterUploadProgress from 'calypso/state/selectors/get-poster-upload-progress';

describe( 'getPosterUploadProgress()', () => {
	test( 'should return the upload progress', () => {
		const percentage = 50;
		const uploadProgress = getPosterUploadProgress( {
			editor: {
				videoEditor: {
					uploadProgress: percentage,
				},
			},
		} );

		expect( uploadProgress ).toEqual( percentage );
	} );
} );
