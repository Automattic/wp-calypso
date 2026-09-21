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
import type { BlockAttributes, EditorBlock } from '../../../utils/editor-blocks';

const DARK = '#112233';
const LIGHT = '#eeeeee';

const cover = ( attributes: BlockAttributes = {} ): EditorBlock => ( {
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

/** Syncs after the update landed, with the cover reading as the update left it. */
const sync = ( before: EditorBlock, requested: BlockAttributes | null ) => {
	jest
		.mocked( getBlock )
		.mockReturnValue( { ...before, attributes: { ...before.attributes, ...requested } } );

	return syncCoverWithImage( 'cover', before, requested, write );
};

beforeEach( () => {
	jest.clearAllMocks();
	mockGetColorAsync.mockResolvedValue( { hex: DARK } );
} );

describe( 'syncCoverWithImage', () => {
	it( 'recolours the overlay from the new image and drops what belonged to the old one', async () => {
		await sync( cover(), { url: 'new.jpg' } );

		expect( mockGetColorAsync ).toHaveBeenCalledWith( 'new.jpg', { silent: true } );
		expect( write ).toHaveBeenCalledWith( 'cover', recoloured( DARK, true ) );
	} );

	it( 'falls back to white when the image cannot be read', async () => {
		mockGetColorAsync.mockRejectedValue( new Error( 'tainted' ) );

		await sync( cover(), { url: 'new.jpg' } );

		expect( write ).toHaveBeenCalledWith( 'cover', recoloured( '#FFF', false ) );
	} );

	it( 'keeps the default colour when the image never loads', async () => {
		jest.useFakeTimers();
		mockGetColorAsync.mockReturnValue( new Promise( () => {} ) );

		const synced = sync( cover(), { url: 'new.jpg' } );
		await jest.advanceTimersByTimeAsync( 5000 );
		await synced;

		expect( write ).toHaveBeenCalledWith( 'cover', recoloured( '#FFF', false ) );
		jest.useRealTimers();
	} );

	it( 'eases the dim ratio for a first image, which a full overlay would hide', async () => {
		await sync( cover( { url: undefined, dimRatio: 100 } ), { url: 'new.jpg' } );

		expect( write ).toHaveBeenCalledWith( 'cover', { ...recoloured( DARK, true ), dimRatio: 50 } );
	} );

	it( "keeps the request's own values", async () => {
		await sync( cover( { url: undefined, dimRatio: 100 } ), {
			url: 'new.jpg',
			dimRatio: 80,
			focalPoint: { x: 0.2, y: 0.8 },
		} );

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

		await sync( before, requested );

		expect( write ).toHaveBeenCalledWith( 'cover', { ...cleared, ...expected } );
	} );

	it( 'leaves `isDark` alone for a palette overlay the palette lacks', async () => {
		await sync( cover(), { url: 'new.jpg', overlayColor: 'gone' } );

		expect( write ).toHaveBeenCalledWith( 'cover', cleared );
	} );

	// The analysis takes a moment, and the user may act during it.
	it.each( [
		[ 'the image changed again', { url: 'other.jpg' } ],
		[ 'the user chose an overlay', { url: 'new.jpg', isUserOverlayColor: true } ],
		[ 'the dim ratio changed', { url: 'new.jpg', dimRatio: 80 } ],
	] )( 'writes nothing when %s meanwhile', async ( _, meanwhile ) => {
		jest.mocked( getBlock ).mockReturnValue( cover( meanwhile ) );

		await syncCoverWithImage( 'cover', cover(), { url: 'new.jpg' }, write );

		expect( write ).not.toHaveBeenCalled();
	} );

	// The image is already written by then; the colour is what a failed chunk costs.
	it( 'settles the image without a colour when the colour libraries fail to load', async () => {
		jest.resetModules();
		jest.doMock( 'fast-average-color', () => {
			throw new Error( 'chunk failed' );
		} );
		const editorBlocks = await import( '../../../utils/editor-blocks' );
		const { syncCoverWithImage: isolated } = await import( '../cover-image' );
		jest.mocked( editorBlocks.getBlock ).mockReturnValue( cover( { url: 'new.jpg' } ) );

		await isolated( 'cover', cover(), { url: 'new.jpg' }, write );

		expect( write ).toHaveBeenCalledWith( 'cover', cleared );
	} );

	it.each( [
		[ 'the block is not a cover', { ...cover(), name: 'core/image' }, { url: 'new.jpg' } ],
		[ 'the image is unchanged', cover(), { url: 'old.jpg' } ],
		[ 'no image is set', cover(), { dimRatio: 30 } ],
		[ 'there are no attributes', cover(), null ],
	] )( 'writes nothing when %s', async ( _, before, requested ) => {
		await sync( before, requested );

		expect( mockGetColorAsync ).not.toHaveBeenCalled();
		expect( write ).not.toHaveBeenCalled();
	} );
} );
