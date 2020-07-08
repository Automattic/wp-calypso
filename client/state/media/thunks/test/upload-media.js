/**
 * Internal dependencies
 */
import { uploadMedia as uploadMediaThunk } from 'state/media/thunks/upload-media';
import {
	dispatchFluxFetchMediaLimits,
	dispatchFluxReceiveMediaItemError,
	dispatchFluxReceiveMediaItemSuccess,
} from 'state/media/utils/flux-adapter';
import * as syncActions from 'state/media/actions';
import { createTransientMediaItems } from 'state/media/thunks/create-transient-media-items';

jest.mock( 'state/media/utils/is-file-list', () => ( {
	isFileList: jest.fn(),
} ) );

jest.mock( 'state/media/thunks/create-transient-media-items', () => ( {
	createTransientMediaItems: jest.fn(),
} ) );

jest.mock( 'state/media/utils/flux-adapter', () => ( {
	dispatchFluxFetchMediaLimits: jest.fn(),
	dispatchFluxReceiveMediaItemError: jest.fn(),
	dispatchFluxReceiveMediaItemSuccess: jest.fn(),
} ) );

describe( 'media - thunks - uploadMedia', () => {
	let dispatch, fileUploader;

	const siteId = 1343323;
	const site = { ID: siteId };
	const file = Object.freeze( {
		fileContents: Symbol( 'file contents' ),
		fileName: Symbol( 'file name' ),
	} );
	const savedId = Symbol( 'saved id' );

	beforeEach( () => {
		jest.resetAllMocks();
		dispatch = jest.fn( ( x ) => x );
		fileUploader = jest.fn( ( mediaFile ) =>
			Promise.resolve( { media: [ { ...mediaFile, ID: savedId } ], found: 1 } )
		);
		createTransientMediaItems.mockImplementation( ( mediaFiles ) =>
			mediaFiles.map( ( mediaFile, index ) => ( {
				...mediaFile,
				ID: `generated-id-${ index }`,
			} ) )
		);
	} );

	const uploadMedia = ( ...args ) => uploadMediaThunk( ...args )( dispatch );

	describe( 'when upload succeeds', () => {
		beforeEach( () => {
			fileUploader.mockImplementationOnce( ( mediaFile ) =>
				Promise.resolve( { media: [ { ...mediaFile, ID: savedId } ], found: 1 } )
			);
		} );

		it( 'should create the media item', async () => {
			const successMediaItemRequest = jest.spyOn( syncActions, 'successMediaItemRequest' );
			const receiveMedia = jest.spyOn( syncActions, 'receiveMedia' );
			const failMediaItemRequest = jest.spyOn( syncActions, 'failMediaItemRequest' );

			await expect( uploadMedia( file, site, fileUploader ) ).resolves.toEqual( [
				{
					...file,
					ID: savedId,
					transientId: 'generated-id-0',
				},
			] );

			expect( createTransientMediaItems ).toHaveBeenCalledWith( [ { ...file } ], site );
			expect( successMediaItemRequest ).toHaveBeenCalledWith( siteId, 'generated-id-0' );
			expect( receiveMedia ).toHaveBeenCalledWith(
				siteId,
				{
					...file,
					ID: savedId,
					transientId: 'generated-id-0',
				},
				1 // found
			);
			expect( failMediaItemRequest ).not.toHaveBeenCalled();
		} );

		it( 'should call the onItemSuccess callback', async () => {
			const onItemUploaded = jest.fn();
			await uploadMedia( file, site, fileUploader, onItemUploaded );

			expect( onItemUploaded ).toHaveBeenCalledWith(
				{
					...file,
					ID: savedId,
					transientId: 'generated-id-0',
				},
				file
			);
		} );

		describe( 'flux adaptation', () => {
			it( 'should dispatch flux receive and media limits actions', async () => {
				await expect( uploadMedia( file, site, fileUploader ) ).resolves.toEqual( [
					{ ...file, ID: savedId, transientId: 'generated-id-0' },
				] );

				expect( dispatchFluxReceiveMediaItemSuccess ).toHaveBeenCalledWith(
					'generated-id-0',
					siteId,
					{
						...file,
						ID: savedId,
					}
				);
				expect( dispatchFluxFetchMediaLimits ).toHaveBeenCalledWith( siteId );
			} );
		} );
	} );

	describe( 'when upload fails', () => {
		const error = new Error( 'mock error' );

		beforeEach( () => {
			fileUploader.mockRejectedValueOnce( error );
		} );

		it( 'should dispatch failMediaItemRequest and resolve with an empty array', async () => {
			const successMediaItemRequest = jest.spyOn( syncActions, 'successMediaItemRequest' );
			const receiveMedia = jest.spyOn( syncActions, 'receiveMedia' );
			const failMediaItemRequest = jest.spyOn( syncActions, 'failMediaItemRequest' );

			await expect( uploadMedia( file, site, fileUploader ) ).resolves.toEqual( [] );

			expect( successMediaItemRequest ).not.toHaveBeenCalled();
			expect( receiveMedia ).not.toHaveBeenCalled();
			expect( failMediaItemRequest ).toHaveBeenCalledWith( siteId, 'generated-id-0', error );
		} );

		it( 'should call the onItemFailure callback', async () => {
			const onItemFailure = jest.fn();
			await uploadMedia( file, site, fileUploader, jest.fn(), onItemFailure );

			expect( onItemFailure ).toHaveBeenCalledWith( { ...file } );
		} );

		describe( 'flux adaptation', () => {
			it( 'should dispatch flux error action', async () => {
				await expect( uploadMedia( file, site, fileUploader ) ).resolves.toEqual( [] );

				expect( dispatchFluxReceiveMediaItemError ).toHaveBeenCalledWith(
					'generated-id-0',
					siteId,
					error
				);
			} );
		} );
	} );
} );
