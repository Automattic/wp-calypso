import { addExternalMedia as addExternalMediaThunk } from 'calypso/state/media/thunks/add-external-media';
import { uploadMedia } from 'calypso/state/media/thunks/upload-media';

jest.mock( 'calypso/state/media/thunks/upload-media', () => ( {
	uploadMedia: jest.fn(),
	uploadSingleMedia: jest.fn(),
} ) );

describe( 'media - thunks - addExternalMedia', () => {
	const postId = 0;
	const site = Symbol( 'site' );
	const file = Symbol( 'file' );
	const service = Symbol( 'service' );
	const dispatch = jest.fn();
	const getState = jest.fn();

	const addExternalMedia = ( ...args ) => addExternalMediaThunk( ...args )( dispatch, getState );

	describe( 'single file', () => {
		it( 'should dispatch to uploadMedia with the file uploader', async () => {
			await addExternalMedia( file, site, postId, service );

			expect( uploadMedia ).toHaveBeenCalledWith( file, site, postId, expect.any( Function ) );
		} );
	} );

	describe( 'multiple files', () => {
		it( 'should dispatch to uploadMedia with the file uploader', async () => {
			await addExternalMedia( [ file, file ], site, postId, service );

			expect( uploadMedia ).toHaveBeenCalledWith(
				[ file, file ],
				site,
				postId,
				expect.any( Function )
			);
		} );
	} );
} );
