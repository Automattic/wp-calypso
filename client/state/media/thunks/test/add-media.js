import { getFileUploader } from 'calypso/lib/media/utils';
import { addMedia as addMediaThunk } from 'calypso/state/media/thunks/add-media';
import { uploadMedia } from 'calypso/state/media/thunks/upload-media';

jest.mock( 'calypso/lib/media/utils', () => ( { getFileUploader: jest.fn() } ) );
jest.mock( 'calypso/state/media/thunks/upload-media', () => ( {
	uploadMedia: jest.fn(),
	uploadSingleMedia: jest.fn(),
} ) );

describe( 'media - thunks - addMedia', () => {
	const postId = 0;
	const site = Symbol( 'site' );
	const file = Symbol( 'file' );
	const dispatch = jest.fn();
	const getState = jest.fn();

	const addMedia = ( ...args ) => addMediaThunk( ...args )( dispatch, getState );

	describe( 'single file', () => {
		it( 'should dispatch to uploadMedia with the file uploader', async () => {
			await addMedia( file, site, postId );

			expect( uploadMedia ).toHaveBeenCalledWith( file, site, postId, getFileUploader );
		} );
	} );

	describe( 'multiple files', () => {
		it( 'should dispatch to uploadMedia with the file uploader', async () => {
			await addMedia( [ file, file ], site, postId );

			expect( uploadMedia ).toHaveBeenCalledWith( [ file, file ], site, postId, getFileUploader );
		} );
	} );
} );
