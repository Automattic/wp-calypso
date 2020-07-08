/**
 * Internal dependencies
 */
import { addMedia as addMediaThunk } from 'state/media/thunks/add-media';
import { uploadMedia, uploadSingleMedia } from 'state/media/thunks/upload-media';
import { getFileUploader } from 'lib/media/utils';

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

	it( 'should dispatch to uploadSingleMedia with the file uploader', async () => {
		const uploader = jest.fn();
		getFileUploader.mockReturnValueOnce( uploader );
		await addMedia( site, file );

		expect( uploadSingleMedia ).toHaveBeenCalledWith( file, site, uploader );
	} );

	it( 'should dispatch to uploadMedia with the file uploader', async () => {
		const uploader = jest.fn();
		getFileUploader.mockReturnValueOnce( uploader );
		await addMedia( site, [ file, file ] );

		expect( uploadMedia ).toHaveBeenCalledWith( [ file, file ], site, uploader );
	} );
} );
