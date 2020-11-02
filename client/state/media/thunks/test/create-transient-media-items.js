/**
 * Internal dependencies
 */
import { createTransientMediaItems as createTransientMediaItemsThunk } from 'calypso/state/media/thunks/create-transient-media-items';
import { createTransientMedia, validateMediaItem } from 'calypso/lib/media/utils';
import * as dateUtils from 'calypso/state/media/utils/transient-date';
import * as syncActions from 'calypso/state/media/actions';

jest.mock( 'lib/media/utils', () => ( {
	createTransientMedia: jest.fn(),
	validateMediaItem: jest.fn(),
} ) );

describe( 'media - thunks - createTransientMediaItems', () => {
	const dispatch = jest.fn();

	const transientDate = Symbol( 'transient date' );
	const siteId = 1343323;
	const site = { ID: siteId };
	const transientId = Symbol( 'transient id' );
	const file = Object.freeze( {
		ID: transientId,
		fileContents: Symbol( 'file contents' ),
		fileName: Symbol( 'file name' ),
	} );

	const createTransientMediaItems = ( ...args ) =>
		createTransientMediaItemsThunk( ...args )( dispatch );

	afterEach( () => {
		jest.resetAllMocks();
		createTransientMedia.mockImplementation( ( x ) => x );
	} );

	it( 'should return the list of transient items', () => {
		jest.spyOn( dateUtils, 'getTransientDate' ).mockReturnValue( transientDate );
		createTransientMedia.mockReturnValueOnce( { transient: true } );
		const result = createTransientMediaItems( [ file ], site );
		expect( result ).toEqual( [
			{
				date: transientDate,
				ID: transientId,
				transient: true,
			},
		] );
	} );

	describe( 'actions', () => {
		it( 'should dispatch createMediaItem', () => {
			const createMediaItem = jest.spyOn( syncActions, 'createMediaItem' );
			createTransientMediaItems( [ file ], site );

			expect( createMediaItem ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'validation', () => {
		it( 'should set media item errors and throw if validation returns errors', () => {
			const errors = [ 'an error' ];
			validateMediaItem.mockReturnValueOnce( errors );

			const setMediaItemErrors = jest.spyOn( syncActions, 'setMediaItemErrors' );

			// upon failure we return undefined for that file rather than throwing
			expect( createTransientMediaItems( [ file ], site ) ).toEqual( [ undefined ] );

			expect( validateMediaItem ).toHaveBeenCalledWith( site, {
				...file,
			} );
			expect( setMediaItemErrors ).toHaveBeenCalledWith( siteId, transientId, errors );
		} );

		it.each( [ [], undefined, null ] )(
			'should not set media item errors or throw if validation returns %s',
			( nonError ) => {
				validateMediaItem.mockReturnValueOnce( nonError );

				const setMediaItemErrors = jest.spyOn( syncActions, 'setMediaItemErrors' );

				createTransientMediaItems( [ file ], site );

				expect( validateMediaItem ).toHaveBeenCalledWith( site, {
					...file,
				} );
				expect( setMediaItemErrors ).not.toHaveBeenCalled();
			}
		);
	} );

	describe( 'transient id', () => {
		const generatedId = Symbol( 'generated id' );
		it( 'should generate a transient ID', () => {
			createTransientMedia.mockReturnValueOnce( { ID: generatedId } );

			const createMediaItem = jest.spyOn( syncActions, 'createMediaItem' );

			const { ID, ...fileWithoutPassedInId } = file;

			createTransientMediaItems( [ fileWithoutPassedInId ], site );

			expect( createMediaItem ).toHaveBeenCalledWith( site, {
				ID: generatedId,
			} );
		} );

		it( 'should override the generated transient ID with the one passed in', () => {
			// just a descriptive alias
			const { ID: passedInId } = file;
			const createMediaItem = jest.spyOn( syncActions, 'createMediaItem' );

			createTransientMediaItems( [ file ], site );

			expect( createMediaItem ).toHaveBeenCalledWith( site, {
				...file,
				ID: passedInId,
			} );
		} );
	} );
} );
