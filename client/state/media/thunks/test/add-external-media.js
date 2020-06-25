/**
 * Internal dependencies
 */
import { addExternalMedia as addExternalMediaThunk } from 'state/media/thunks/add-external-media';
import { uploadMedia } from 'state/media/thunks/upload-media';
import { getFileUploader } from 'lib/media/utils';

jest.mock( 'lib/media/utils', () => ( { getFileUploader: jest.fn() } ) );
jest.mock( 'state/media/thunks/upload-media', () => ( { uploadMedia: jest.fn() } ) );

describe( 'media - thunks - addMedia', () => {
	const site = Symbol( 'site' );
	const file = Symbol( 'file' );
	const service = Symbol( 'service' );
	const transientDate = Symbol( 'transientDate' );
	const dispatch = jest.fn();
	const getState = jest.fn();

	const addExternalMedia = ( ...args ) => addExternalMediaThunk( ...args )( dispatch, getState );

	it( 'should dispatch to uploadMedia with the file uploader', async () => {
		const uploader = jest.fn();
		getFileUploader.mockReturnValueOnce( uploader );
		await addExternalMedia( site, file, service, transientDate );

		expect( uploadMedia ).toHaveBeenCalledWith( site, file, uploader, transientDate );
	} );

	it( 'should default transientDate to undefined', async () => {
		const uploader = jest.fn();
		getFileUploader.mockReturnValueOnce( uploader );
		await addExternalMedia( site, file, service );

		expect( uploadMedia ).toHaveBeenCalledWith( site, file, uploader, undefined );
	} );
} );
