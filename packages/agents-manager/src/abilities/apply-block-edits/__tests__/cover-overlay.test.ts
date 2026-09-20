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

import { updateCoverOverlay } from '../cover-overlay';
import type { EditorBlock } from '../../../utils/editor-blocks';

const cover = ( attributes: Record< string, unknown > = {} ): EditorBlock => ( {
	clientId: 'cover',
	name: 'core/cover',
	attributes: { url: 'old.jpg', ...attributes },
	innerBlocks: [],
} );
const write = jest.fn();

beforeEach( () => {
	jest.clearAllMocks();
	mockGetColorAsync.mockResolvedValue( { hex: '#112233' } );
} );

describe( 'updateCoverOverlay', () => {
	it( 'writes the overlay from the new image, and whether it is dark', async () => {
		await updateCoverOverlay( 'cover', cover(), { url: 'new.jpg' }, write );

		expect( mockGetColorAsync ).toHaveBeenCalledWith(
			'new.jpg',
			expect.objectContaining( { silent: true } )
		);
		expect( write ).toHaveBeenCalledWith( 'cover', {
			overlayColor: undefined,
			customOverlayColor: '#112233',
			isUserOverlayColor: false,
			isDark: true,
		} );
	} );

	it( 'falls back to white when the image cannot be read', async () => {
		mockGetColorAsync.mockRejectedValue( new Error( 'tainted' ) );

		await updateCoverOverlay( 'cover', cover(), { url: 'new.jpg' }, write );

		expect( write ).toHaveBeenCalledWith(
			'cover',
			expect.objectContaining( { customOverlayColor: '#FFF', isDark: false } )
		);
	} );

	it.each( [
		[ 'the block is not a cover', { ...cover(), name: 'core/image' }, { url: 'new.jpg' } ],
		[ 'the image is unchanged', cover(), { url: 'old.jpg' } ],
		[ 'no image is set', cover(), { dimRatio: 30 } ],
		[ 'the update sets an overlay colour', cover(), { url: 'new.jpg', overlayColor: 'vivid-red' } ],
		[ 'the update sets a custom overlay', cover(), { url: 'new.jpg', customOverlayColor: '#000' } ],
		[ 'the user chose the overlay', cover( { isUserOverlayColor: true } ), { url: 'new.jpg' } ],
	] )( 'leaves the overlay alone when %s', async ( _, before, requested ) => {
		await updateCoverOverlay( 'cover', before, requested, write );

		expect( mockGetColorAsync ).not.toHaveBeenCalled();
		expect( write ).not.toHaveBeenCalled();
	} );
} );
