import { describeCaptureShape, getUnframedClientIds } from '../framing';
import type { FilePart } from '../capture';

const part = ( metadata?: Record< string, unknown > ) =>
	( {
		type: 'file',
		file: { name: 'canvas.webp', mimeType: 'image/webp', bytes: 'AAAA' },
		...( metadata && { metadata } ),
	} ) as FilePart;

describe( 'getUnframedClientIds', () => {
	const mountCanvasWith = ( boxes: Record< string, { width: number; height: number } > ) => {
		const frame = document.createElement( 'iframe' );
		frame.name = 'editor-canvas';
		document.body.append( frame );

		const canvasDocument = frame.contentDocument as Document;

		Object.entries( boxes ).forEach( ( [ clientId, box ] ) => {
			const element = canvasDocument.createElement( 'div' );
			element.setAttribute( 'data-block', clientId );
			element.getBoundingClientRect = () => box as DOMRect;
			canvasDocument.body.append( element );
		} );
	};

	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'reports nothing when every block is laid out', () => {
		mountCanvasWith( { 'project-details': { width: 600, height: 400 } } );

		expect( getUnframedClientIds( [ 'project-details' ] ) ).toEqual( [] );
	} );

	it( 'reports a block that is not in the canvas', () => {
		mountCanvasWith( {} );

		expect( getUnframedClientIds( [ 'project-details' ] ) ).toEqual( [ 'project-details' ] );
	} );

	it( 'reports a block with no layout', () => {
		// `display: none`, or detached. It has an element but no box, so there
		// is nothing for a capture to frame.
		mountCanvasWith( { hidden: { width: 0, height: 0 } } );

		expect( getUnframedClientIds( [ 'hidden' ] ) ).toEqual( [ 'hidden' ] );
	} );

	it( 'accepts a block that is merely scrolled out of view', () => {
		// Matches the rasterizer: a block off screen still has a box, and the
		// capture moves the page to bring it into frame.
		mountCanvasWith( { below: { width: 600, height: 400 } } );

		expect( getUnframedClientIds( [ 'below' ] ) ).toEqual( [] );
	} );

	it( 'reports every block when the canvas is not mounted', () => {
		expect( getUnframedClientIds( [ 'a', 'b' ] ) ).toEqual( [ 'a', 'b' ] );
	} );
} );

describe( 'describeCaptureShape', () => {
	it( 'says nothing about an ordinary screenful', () => {
		// The common case by far. A sentence here would be noise on every
		// single capture.
		expect( describeCaptureShape( [ part( { fullPage: false } ) ] ) ).toBe( '' );
	} );

	it( 'warns that a whole page is not legible', () => {
		const message = describeCaptureShape( [ part( { fullPage: true } ) ] );

		expect( message ).toContain( 'whole page' );
		expect( message ).toContain( 'not be legible' );
	} );

	it( 'says how many areas a set of bands covers', () => {
		// Without this a reader has no way to tell several different places
		// from several attempts at the same one.
		const message = describeCaptureShape( [
			part( { regionIndex: 1, regionCount: 2 } ),
			part( { regionIndex: 2, regionCount: 2 } ),
		] );

		expect( message ).toContain( '2 pictures' );
		expect( message ).toContain( 'top to bottom' );
	} );

	it( 'says nothing for no files', () => {
		expect( describeCaptureShape( [] ) ).toBe( '' );
	} );
} );
