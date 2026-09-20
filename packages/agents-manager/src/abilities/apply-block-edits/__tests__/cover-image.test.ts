const mockGetColorAsync = jest.fn();

jest.mock( 'fast-average-color', () => ( {
	FastAverageColor: class {
		getColorAsync = mockGetColorAsync;
	},
} ) );
jest.mock( '../../../utils/editor-blocks', () => ( {
	getBlock: jest.fn(),
	getPaletteColor: ( slug: string ) => ( slug === 'vivid-red' ? '#cf2e2e' : undefined ),
} ) );

import { getBlock } from '../../../utils/editor-blocks';
import { syncCoverWithImage } from '../cover-image';
import type { EditorBlock } from '../../../utils/editor-blocks';

const DARK = '#112233';
const LIGHT = '#eeeeee';

const cover = ( attributes: Record< string, unknown > = {} ): EditorBlock => ( {
	clientId: 'cover',
	name: 'core/cover',
	attributes: { url: 'old.jpg', dimRatio: 50, ...attributes },
	innerBlocks: [],
} );
const write = jest.fn();
const cleared = { focalPoint: undefined, useFeaturedImage: undefined };
const recoloured = ( color: string, isDark: boolean ) => ( {
	...cleared,
	overlayColor: undefined,
	customOverlayColor: color,
	isUserOverlayColor: false,
	isDark,
} );

beforeEach( () => {
	jest.clearAllMocks();
	mockGetColorAsync.mockResolvedValue( { hex: DARK } );
	// The cover as the image analysis finds it: the new image, nothing else changed.
	jest.mocked( getBlock ).mockReturnValue( cover( { url: 'new.jpg' } ) );
} );

describe( 'syncCoverWithImage', () => {
	it( 'recolours the overlay from the new image and drops what belonged to the old one', async () => {
		await syncCoverWithImage( 'cover', cover(), { url: 'new.jpg' }, write );

		expect( mockGetColorAsync ).toHaveBeenCalledWith( 'new.jpg', { silent: true } );
		expect( write ).toHaveBeenCalledWith( 'cover', recoloured( DARK, true ) );
	} );

	it( 'falls back to white when the image cannot be read', async () => {
		mockGetColorAsync.mockRejectedValue( new Error( 'tainted' ) );

		await syncCoverWithImage( 'cover', cover(), { url: 'new.jpg' }, write );

		expect( write ).toHaveBeenCalledWith( 'cover', recoloured( '#FFF', false ) );
	} );

	it( 'eases the dim ratio for a first image, which a full overlay would hide', async () => {
		await syncCoverWithImage(
			'cover',
			cover( { url: undefined, dimRatio: 100 } ),
			{ url: 'new.jpg' },
			write
		);

		expect( write ).toHaveBeenCalledWith( 'cover', { ...recoloured( DARK, true ), dimRatio: 50 } );
	} );

	it( "keeps the request's own values", async () => {
		await syncCoverWithImage(
			'cover',
			cover( { url: undefined, dimRatio: 100 } ),
			{ url: 'new.jpg', dimRatio: 80, focalPoint: { x: 0.2, y: 0.8 } },
			write
		);

		expect( write ).toHaveBeenCalledWith( 'cover', {
			useFeaturedImage: undefined,
			overlayColor: undefined,
			customOverlayColor: DARK,
			isUserOverlayColor: false,
			isDark: true,
		} );
	} );

	// A chosen overlay stays, and `isDark` follows it composited over the new
	// image. A form the request sets clears the other, which would win over it.
	it.each( [
		[
			'an opaque dark overlay over a light image',
			cover( { isUserOverlayColor: true, customOverlayColor: '#000', dimRatio: 100 } ),
			{ url: 'new.jpg' },
			LIGHT,
			{ isDark: true },
		],
		[
			'a faint light overlay over a dark image',
			cover( { isUserOverlayColor: true, customOverlayColor: '#fff', dimRatio: 30 } ),
			{ url: 'new.jpg' },
			DARK,
			{ isDark: true },
		],
		[
			'a half-strength palette overlay the request sets, over a light image',
			cover( { customOverlayColor: '#000' } ),
			{ url: 'new.jpg', overlayColor: 'vivid-red' },
			LIGHT,
			{ customOverlayColor: undefined, isDark: false },
		],
		[
			'a half-strength custom overlay the request sets, over a light image',
			cover( { overlayColor: 'vivid-red' } ),
			{ url: 'new.jpg', customOverlayColor: '#000' },
			LIGHT,
			{ overlayColor: undefined, isDark: true },
		],
	] )( 'keeps %s and judges its darkness', async ( _, before, requested, image, expected ) => {
		mockGetColorAsync.mockResolvedValue( { hex: image } );
		jest
			.mocked( getBlock )
			.mockReturnValue( { ...before, attributes: { ...before.attributes, url: 'new.jpg' } } );

		await syncCoverWithImage( 'cover', before, requested, write );

		expect( write ).toHaveBeenCalledWith( 'cover', { ...cleared, ...expected } );
	} );

	it( 'leaves `isDark` alone for a palette overlay the palette lacks', async () => {
		await syncCoverWithImage( 'cover', cover(), { url: 'new.jpg', overlayColor: 'gone' }, write );

		expect( write ).toHaveBeenCalledWith( 'cover', cleared );
	} );

	// The analysis takes a moment, and the user may act during it.
	it( 'writes nothing when the image changed again meanwhile', async () => {
		jest.mocked( getBlock ).mockReturnValue( cover( { url: 'other.jpg' } ) );

		await syncCoverWithImage( 'cover', cover(), { url: 'new.jpg' }, write );

		expect( write ).not.toHaveBeenCalled();
	} );

	it( 'keeps an overlay the user chose meanwhile', async () => {
		jest
			.mocked( getBlock )
			.mockReturnValue( cover( { url: 'new.jpg', isUserOverlayColor: true } ) );

		await syncCoverWithImage( 'cover', cover(), { url: 'new.jpg' }, write );

		expect( write ).toHaveBeenCalledWith( 'cover', { ...cleared, isDark: true } );
	} );

	// The image is already written by then; the colour is what a failed chunk costs.
	it( 'settles the image without a colour when the colour libraries fail to load', async () => {
		jest.resetModules();
		jest.doMock( 'colord', () => {
			throw new Error( 'chunk failed' );
		} );
		const editorBlocks = await import( '../../../utils/editor-blocks' );
		const { syncCoverWithImage: sync } = await import( '../cover-image' );
		jest.mocked( editorBlocks.getBlock ).mockReturnValue( cover( { url: 'new.jpg' } ) );

		await sync( 'cover', cover(), { url: 'new.jpg' }, write );

		expect( write ).toHaveBeenCalledWith( 'cover', cleared );
		jest.dontMock( 'colord' );
	} );

	it.each( [
		[ 'the block is not a cover', { ...cover(), name: 'core/image' }, { url: 'new.jpg' } ],
		[ 'the image is unchanged', cover(), { url: 'old.jpg' } ],
		[ 'no image is set', cover(), { dimRatio: 30 } ],
		[ 'there are no attributes', cover(), null ],
	] )( 'writes nothing when %s', async ( _, before, requested ) => {
		await syncCoverWithImage( 'cover', before, requested, write );

		expect( mockGetColorAsync ).not.toHaveBeenCalled();
		expect( write ).not.toHaveBeenCalled();
	} );
} );
