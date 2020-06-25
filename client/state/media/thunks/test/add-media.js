/**
 * Internal dependencies
 */
import { addMedia as addMediaThunk } from 'state/media/thunks/add-media';
import { uploadMedia } from 'state/media/thunks/upload-media';
import { getFileUploader } from 'lib/media/utils';

jest.mock( 'lib/media/utils', () => ( { getFileUploader: jest.fn() } ) );
jest.mock( 'state/media/thunks/upload-media', () => ( { uploadMedia: jest.fn() } ) );

describe( 'media - thunks - addMedia', () => {
	const site = Symbol( 'site' );
	const file = Symbol( 'file' );
	const transientDate = Symbol( 'transientDate' );
	const dispatch = jest.fn();
	const getState = jest.fn();

	const addMedia = ( ...args ) => addMediaThunk( ...args )( dispatch, getState );

	it( 'should dispatch to uploadMedia with the file uploader', async () => {
		const uploader = jest.fn();
		getFileUploader.mockReturnValueOnce( uploader );
		await addMedia( site, file, transientDate );

		expect( uploadMedia ).toHaveBeenCalledWith( site, file, uploader, transientDate );
	} );

	it( 'should default transientDate to undefined', async () => {
		const uploader = jest.fn();
		getFileUploader.mockReturnValueOnce( uploader );
		await addMedia( site, file );

		expect( uploadMedia ).toHaveBeenCalledWith( site, file, uploader, undefined );
	} );
} );
