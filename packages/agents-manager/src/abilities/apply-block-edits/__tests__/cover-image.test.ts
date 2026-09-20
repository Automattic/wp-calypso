const mockGetColorAsync = jest.fn();

jest.mock( 'colord', () => ( {
	colord: ( color: string ) => ( {
		toRgb: () => ( { r: 255, g: 255, b: 255, a: 1 } ),
		isDark: () => color === '#112233',
	} ),
} ) );
jest.mock( 'fast-average-color', () => ( {
	FastAverageColor: class {
		getColorAsync = mockGetColorAsync;
	},
} ) );

import { updateCoverForImage } from '../cover-image';
import type { EditorBlock } from '../../../utils/editor-blocks';

const cover = ( attributes: Record< string, unknown > = {} ): EditorBlock => ( {
	clientId: 'cover',
	name: 'core/cover',
	attributes: { url: 'old.jpg', dimRatio: 50, ...attributes },
	innerBlocks: [],
} );
const write = jest.fn();
const recoloured = {
	focalPoint: undefined,
	useFeaturedImage: undefined,
	overlayColor: undefined,
	customOverlayColor: '#112233',
	isUserOverlayColor: false,
	isDark: true,
};

beforeEach( () => {
	jest.clearAllMocks();
	mockGetColorAsync.mockResolvedValue( { hex: '#112233' } );
} );

describe( 'updateCoverForImage', () => {
	it( 'recolours the overlay from the new image and drops what belonged to the old one', async () => {
		await updateCoverForImage( 'cover', cover(), { url: 'new.jpg' }, write );

		expect( mockGetColorAsync ).toHaveBeenCalledWith(
			'new.jpg',
			expect.objectContaining( { silent: true } )
		);
		expect( write ).toHaveBeenCalledWith( 'cover', recoloured );
	} );

	it( 'falls back to white when the image cannot be read', async () => {
		mockGetColorAsync.mockRejectedValue( new Error( 'tainted' ) );

		await updateCoverForImage( 'cover', cover(), { url: 'new.jpg' }, write );

		expect( write ).toHaveBeenCalledWith(
			'cover',
			expect.objectContaining( { customOverlayColor: '#FFF', isDark: false } )
		);
	} );

	it( 'eases the dim ratio for a first image, which a full overlay would hide', async () => {
		await updateCoverForImage(
			'cover',
			cover( { url: undefined, dimRatio: 100 } ),
			{ url: 'new.jpg' },
			write
		);

		expect( write ).toHaveBeenCalledWith( 'cover', { ...recoloured, dimRatio: 50 } );
	} );

	it( "keeps the request's own values", async () => {
		await updateCoverForImage(
			'cover',
			cover( { url: undefined, dimRatio: 100 } ),
			{ url: 'new.jpg', dimRatio: 80, focalPoint: { x: 0.2, y: 0.8 } },
			write
		);

		expect( write ).toHaveBeenCalledWith( 'cover', {
			useFeaturedImage: undefined,
			overlayColor: undefined,
			customOverlayColor: '#112233',
			isUserOverlayColor: false,
			isDark: true,
		} );
	} );

	it.each( [
		[
			'the request sets an overlay colour',
			cover(),
			{ url: 'new.jpg', overlayColor: 'vivid-red' },
		],
		[
			'the request sets a custom overlay',
			cover(),
			{ url: 'new.jpg', customOverlayColor: '#000' },
		],
		[ 'the user chose the overlay', cover( { isUserOverlayColor: true } ), { url: 'new.jpg' } ],
	] )( 'leaves the overlay alone when %s', async ( _, before, requested ) => {
		await updateCoverForImage( 'cover', before, requested, write );

		expect( mockGetColorAsync ).not.toHaveBeenCalled();
		expect( write ).toHaveBeenCalledWith( 'cover', {
			focalPoint: undefined,
			useFeaturedImage: undefined,
		} );
	} );

	it.each( [
		[ 'the block is not a cover', { ...cover(), name: 'core/image' }, { url: 'new.jpg' } ],
		[ 'the image is unchanged', cover(), { url: 'old.jpg' } ],
		[ 'no image is set', cover(), { dimRatio: 30 } ],
		[ 'there are no attributes', cover(), null ],
	] )( 'writes nothing when %s', async ( _, before, requested ) => {
		await updateCoverForImage( 'cover', before, requested, write );

		expect( write ).not.toHaveBeenCalled();
	} );
} );
