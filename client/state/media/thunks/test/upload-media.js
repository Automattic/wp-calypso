/**
 * Internal dependencies
 */
import { uploadSingleMedia as uploadSingleMediaThunk } from 'state/media/thunks/upload-media';
import { createTransientMedia, validateMediaItem } from 'lib/media/utils';
import * as dateUtils from 'state/media/utils/transient-date';
import * as fluxUtils from 'state/media/utils/flux-adapter';
import * as syncActions from 'state/media/actions';

jest.mock( 'lib/media/utils', () => ( {
	createTransientMedia: jest.fn(),
	validateMediaItem: jest.fn(),
} ) );

describe( 'media - thunks - uploadSingleMedia', () => {
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

	const uploadSingleMedia = ( ...args ) => uploadSingleMediaThunk( ...args )( dispatch, getState );

	describe( 'transient id', () => {
		it( 'should generate a transient ID', async () => {
			createTransientMedia.mockReturnValueOnce( { ID: generatedId } );

			const createMediaItem = jest.spyOn( syncActions, 'createMediaItem' );

			const { ID, ...fileWithoutPassedInId } = file;

			await uploadSingleMedia( fileWithoutPassedInId, site, fileUploader, transientDate );

			expect( createMediaItem ).toHaveBeenCalledWith( site, {
				date: transientDate,
				ID: generatedId,
			} );
		} );

		it( 'should override the generated transient ID with the one passed in', async () => {
			// just a descriptive alias
			const { ID: passedInId } = file;
			const createMediaItem = jest.spyOn( syncActions, 'createMediaItem' );

			await uploadSingleMedia( file, site, fileUploader, transientDate );

			expect( createMediaItem ).toHaveBeenCalledWith( site, {
				...file,
				date: transientDate,
				ID: passedInId,
			} );
		} );
	} );

	describe( 'transient date', () => {
		it( 'should automatically generate one when one is not provided', async () => {
			const getTransientDate = jest.spyOn( dateUtils, 'getTransientDate' );
			const generatedTransientDate = Symbol( 'generated transient date' );
			getTransientDate.mockReturnValueOnce( generatedTransientDate );
			const createMediaItem = jest.spyOn( syncActions, 'createMediaItem' );

			await uploadSingleMedia( file, site, fileUploader );

			expect( createMediaItem ).toHaveBeenCalledWith( site, {
				...file,
				date: generatedTransientDate,
			} );
		} );
	} );

	describe( 'validation', () => {
		it( 'should set media item errors and throw if validation returns errors', async () => {
			const errors = [ 'an error' ];
			validateMediaItem.mockReturnValueOnce( errors );

			const setMediaItemErrors = jest.spyOn( syncActions, 'setMediaItemErrors' );

			await expect( uploadSingleMedia( file, site, fileUploader, transientDate ) ).rejects.toBe(
				errors
			);

			expect( validateMediaItem ).toHaveBeenCalledWith( site, {
				date: transientDate,
				...file,
			} );
			expect( setMediaItemErrors ).toHaveBeenCalledWith( siteId, transientId, errors );
		} );

		it.each( [ [], undefined, null ] )(
			'should not set media item errors or throw if validation returns %s',
			async ( nonError ) => {
				validateMediaItem.mockReturnValueOnce( nonError );

				const setMediaItemErrors = jest.spyOn( syncActions, 'setMediaItemErrors' );

				await uploadSingleMedia( file, site, fileUploader, transientDate );

				expect( validateMediaItem ).toHaveBeenCalledWith( site, {
					date: transientDate,
					...file,
				} );
				expect( setMediaItemErrors ).not.toHaveBeenCalled();
			}
		);
	} );

	describe( 'when upload succeeds', () => {
		it( 'should create the media item', async () => {
			const createMediaItem = jest.spyOn( syncActions, 'createMediaItem' );
			const successMediaItemRequest = jest.spyOn( syncActions, 'successMediaItemRequest' );
			const receiveMedia = jest.spyOn( syncActions, 'receiveMedia' );
			const failMediaItemRequest = jest.spyOn( syncActions, 'failMediaItemRequest' );

			await uploadSingleMedia( file, site, fileUploader, transientDate );

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

		describe( 'flux adaptation', () => {
			it( 'should dispatch flux create, receive, and media limits actions', async () => {
				const fluxCreateMediaItem = jest.spyOn( fluxUtils, 'dispatchFluxCreateMediaItem' );
				const fluxReceiveMediaItemSuccess = jest.spyOn(
					fluxUtils,
					'dispatchFluxReceiveMediaItemSuccess'
				);
				const fluxFetchMediaLimits = jest.spyOn( fluxUtils, 'dispatchFluxFetchMediaLimits' );

				await uploadSingleMedia( file, site, fileUploader, transientDate );

				expect( fluxCreateMediaItem ).toHaveBeenCalledWith(
					{ ...file, date: transientDate },
					site
				);
				expect( fluxReceiveMediaItemSuccess ).toHaveBeenCalledWith( transientId, siteId, {
					...file,
					ID: savedId,
				} );
				expect( fluxFetchMediaLimits ).toHaveBeenCalledWith( siteId );
			} );
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

			await expect( uploadSingleMedia( file, site, fileUploader, transientDate ) ).rejects.toBe(
				error
			);

			expect( createMediaItem ).toHaveBeenCalledWith( site, { ...file, date: transientDate } );
			expect( successMediaItemRequest ).not.toHaveBeenCalled();
			expect( receiveMedia ).not.toHaveBeenCalled();
			expect( failMediaItemRequest ).toHaveBeenCalledWith( siteId, transientId, error );
		} );

		describe( 'flux adaptation', () => {
			it( 'should dispatch flux create and error actions', async () => {
				const error = new Error( 'mock error' );
				fileUploader.mockRejectedValueOnce( error );

				const fluxCreateMediaItem = jest.spyOn( fluxUtils, 'dispatchFluxCreateMediaItem' );
				const fluxReceiveMediaItemError = jest.spyOn(
					fluxUtils,
					'dispatchFluxReceiveMediaItemError'
				);

				await expect( uploadSingleMedia( file, site, fileUploader, transientDate ) ).rejects.toBe(
					error
				);

				expect( fluxCreateMediaItem ).toHaveBeenCalledWith(
					{ ...file, date: transientDate },
					site
				);
				expect( fluxReceiveMediaItemError ).toHaveBeenCalledWith( transientId, siteId, error );
			} );
		} );
	} );
} );
