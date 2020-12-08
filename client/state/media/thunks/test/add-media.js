/**
 * Internal dependencies
 */
import { addMedia as addMediaThunk } from 'calypso/state/media/thunks/add-media';
import { uploadMedia } from 'calypso/state/media/thunks/upload-media';
import { getFileUploader } from 'calypso/lib/media/utils';

jest.mock( 'lib/media/utils', () => ( { getFileUploader: jest.fn() } ) );
jest.mock( 'state/media/thunks/upload-media', () => ( {
	uploadMedia: jest.fn(),
	uploadSingleMedia: jest.fn(),
} ) );

describe( 'media - thunks - addMedia', () => {
	const site = Symbol( 'site' );
	const file = Symbol( 'file' );
	const dispatch = jest.fn();
	const getState = jest.fn();

	const addMedia = ( ...args ) => addMediaThunk( ...args )( dispatch, getState );

	describe( 'single file', () => {
		it( 'should dispatch to uploadMedia with the file uploader', async () => {
			const uploader = jest.fn();
			getFileUploader.mockReturnValueOnce( uploader );
			await addMedia( file, site );

			expect( uploadMedia ).toHaveBeenCalledWith( file, site, uploader );
		} );
	} );

	describe( 'multiple files', () => {
		it( 'should dispatch to uploadMedia with the file uploader', async () => {
			const uploader = jest.fn();
			getFileUploader.mockReturnValueOnce( uploader );
			await addMedia( [ file, file ], site );

			expect( uploadMedia ).toHaveBeenCalledWith( [ file, file ], site, uploader );
		} );
	} );
} );
