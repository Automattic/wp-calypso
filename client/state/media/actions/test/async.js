/**
 * Internal dependencies
 */
import { addMedia as addMediaThunk } from '../async';
import { getFileUploader, createTransientMedia, validateMediaItem } from 'lib/media/utils';

import * as syncActions from '../sync';

jest.mock( 'lib/media/utils', () => ( {
	getFileUploader: jest.fn(),
	createTransientMedia: jest.fn(),
	validateMediaItem: jest.fn(),
} ) );

describe( 'media - actions - async', () => {
	const dispatch = jest.fn();
	const getState = jest.fn();
	const fileUploader = jest.fn();

	const siteId = 1343323;
	const site = { ID: siteId };
	const transientId = Symbol( 'transient id' );
	const transientDate = Symbol( 'transient date' );
	const file = Object.freeze( {
		ID: transientId,
		fileContents: Symbol( 'file contents' ),
		fileName: Symbol( 'file name' ),
	} );
	const generatedId = Symbol( 'generated ID' );
	const savedId = Symbol( 'saved id' );

	beforeEach( () => {
		getFileUploader.mockReturnValue( fileUploader );
		fileUploader.mockImplementation( ( mediaFile ) =>
			Promise.resolve( { media: [ { ...mediaFile, ID: savedId } ], found: 1 } )
		);

		createTransientMedia.mockImplementation( ( mediaFile ) => ( {
			...mediaFile,
			ID: generatedId,
		} ) );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	describe( 'addMedia', () => {
		const addMedia = ( ...args ) => addMediaThunk( ...args )( dispatch, getState );
		describe( 'transient id', () => {
			it( 'should generate a transient ID', async () => {
				createTransientMedia.mockReturnValueOnce( { ID: generatedId } );

				const createMediaItem = jest.spyOn( syncActions, 'createMediaItem' );

				const { ID, ...fileWithoutPassedInId } = file;

				await addMedia( site, fileWithoutPassedInId, transientDate );

				expect( createMediaItem ).toHaveBeenCalledWith( site, {
					date: transientDate,
					ID: generatedId,
				} );
			} );

			it( 'should override the generated transient ID with the one passed in', async () => {
				// just a descriptive alias
				const { ID: passedInId } = file;
				const createMediaItem = jest.spyOn( syncActions, 'createMediaItem' );

				await addMedia( site, file, transientDate );

				expect( createMediaItem ).toHaveBeenCalledWith( site, {
					...file,
					date: transientDate,
					ID: passedInId,
				} );
			} );
		} );

		describe( 'validation', () => {
			it( 'should set media item errors and throw if validation returns errors', async () => {
				const errors = [ 'an error' ];
				validateMediaItem.mockReturnValueOnce( errors );

				const setMediaItemErrors = jest.spyOn( syncActions, 'setMediaItemErrors' );

				await expect( addMedia( site, file, transientDate ) ).rejects.toBe( errors );

				expect( validateMediaItem ).toHaveBeenCalledWith( site, {
					date: transientDate,
					...file,
				} );
				expect( setMediaItemErrors ).toHaveBeenCalledWith( siteId, transientId, errors );
			} );
		} );

		describe( 'when upload succeeds', () => {
			it( 'should create the media item', async () => {
				const createMediaItem = jest.spyOn( syncActions, 'createMediaItem' );
				const successMediaItemRequest = jest.spyOn( syncActions, 'successMediaItemRequest' );
				const receiveMedia = jest.spyOn( syncActions, 'receiveMedia' );
				const failMediaItemRequest = jest.spyOn( syncActions, 'failMediaItemRequest' );

				await addMedia( site, file, transientDate );

				expect( createMediaItem ).toHaveBeenCalledWith( site, { ...file, date: transientDate } );
				expect( successMediaItemRequest ).toHaveBeenCalledWith( siteId, transientId );
				expect( receiveMedia ).toHaveBeenCalledWith(
					siteId,
					{
						...file,
						ID: savedId,
						transientId,
					},
					1 // found
				);
				expect( failMediaItemRequest ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'when upload fails', () => {
			it( 'should dispatch failMediaItemRequest and throw', async () => {
				const error = new Error( 'mock error' );
				fileUploader.mockRejectedValueOnce( error );
				const createMediaItem = jest.spyOn( syncActions, 'createMediaItem' );
				const successMediaItemRequest = jest.spyOn( syncActions, 'successMediaItemRequest' );
				const receiveMedia = jest.spyOn( syncActions, 'receiveMedia' );
				const failMediaItemRequest = jest.spyOn( syncActions, 'failMediaItemRequest' );

				await expect( addMedia( site, file, transientDate ) ).rejects.toBe( error );

				expect( createMediaItem ).toHaveBeenCalledWith( site, { ...file, date: transientDate } );
				expect( successMediaItemRequest ).not.toHaveBeenCalled();
				expect( receiveMedia ).not.toHaveBeenCalled();
				expect( failMediaItemRequest ).toHaveBeenCalledWith( siteId, transientId, error );
			} );
		} );
	} );
} );
