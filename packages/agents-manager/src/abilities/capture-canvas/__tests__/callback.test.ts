jest.mock( '../../../utils/block-ids', () => ( {
	resolveClientId: jest.fn( ( id: string ) => `resolved-${ id }` ),
} ) );
jest.mock( '../../../utils/canvas-capture', () => ( { captureCanvas: jest.fn() } ) );
jest.mock( '../../../utils/editor-blocks', () => ( {
	getBlock: jest.fn( () => ( {} ) ),
} ) );

import { captureCanvas } from '../../../utils/canvas-capture';
import { getBlock } from '../../../utils/editor-blocks';
import { captureCanvasCallback } from '../callback';

const filePart = ( metadata?: Record< string, unknown > ) => ( {
	type: 'file' as const,
	file: { name: 'canvas.webp', mimeType: 'image/webp', bytes: 'AAAA' },
	...( metadata && { metadata } ),
} );

beforeEach( () => {
	jest.clearAllMocks();
	jest.mocked( captureCanvas ).mockResolvedValue( [ filePart() ] );
} );

describe( 'captureCanvasCallback', () => {
	it( 'frames the capture on the resolved blocks and sends the image beside the result', async () => {
		const result = await captureCanvasCallback( { clientIds: [ 'a1', 7, 'b2' ] } );

		expect( captureCanvas ).toHaveBeenCalledWith( {
			clientIds: [ 'resolved-a1', 'resolved-b2' ],
			fullPage: false,
		} );
		expect( result ).toEqual( {
			result: { success: true, message: expect.stringContaining( 'around 2 blocks' ) },
			returnToAgent: true,
			__file_parts: [ filePart() ],
		} );
	} );

	it.each( [ {}, null ] )(
		'describes the visible area when no block was named (%p)',
		async ( input ) => {
			const { result } = await captureCanvasCallback( input );

			expect( captureCanvas ).toHaveBeenCalledWith( { clientIds: [], fullPage: false } );
			expect( result.message ).toMatch( /^Here is the visible area/ );
		}
	);

	// A stale id frames nothing, so the reply must not claim it did.
	it( 'drops an id that names no block on the canvas', async () => {
		jest.mocked( getBlock ).mockReturnValue( undefined );

		const { result } = await captureCanvasCallback( { clientIds: [ 'gone' ] } );

		expect( captureCanvas ).toHaveBeenCalledWith( { clientIds: [], fullPage: false } );
		expect( result.message ).toMatch( /^Here is the visible area/ );
	} );

	// The picture that exists is described, not the one that was asked for.
	it( 'describes the whole page when the capture covered it, and only then', async () => {
		jest.mocked( captureCanvas ).mockResolvedValue( [ filePart( { fullPage: true } ) ] );

		const { result } = await captureCanvasCallback( { fullPage: 'yes' } );

		expect( captureCanvas ).toHaveBeenCalledWith( { clientIds: [], fullPage: false } );
		expect( result.message ).toMatch( /^Here is the whole page/ );
	} );

	it.each( [ null, [] ] )(
		'fails without an image (%p), so the agent does not assume one',
		async ( parts ) => {
			jest.mocked( captureCanvas ).mockResolvedValue( parts );

			const result = await captureCanvasCallback( { fullPage: true } );

			expect( captureCanvas ).toHaveBeenCalledWith( { clientIds: [], fullPage: true } );
			expect( result ).toEqual( {
				result: {
					success: false,
					message: "I couldn't get a picture of the canvas just now.",
					error: expect.stringContaining( 'read the block structure instead' ),
				},
				returnToAgent: true,
			} );
		}
	);
} );
