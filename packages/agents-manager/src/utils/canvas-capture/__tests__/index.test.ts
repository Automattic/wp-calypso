jest.mock( '../../tracks', () => ( { recordBigSkyTracksEvent: jest.fn() } ) );

import type { FilePart } from '..';

const screenshot: FilePart = {
	type: 'file',
	file: { name: 'canvas.webp', mimeType: 'image/webp', bytes: 'AAAA' },
};

// A fresh facade per test, so each one decides what its chunk load does.
async function load( captureModule: () => unknown ) {
	jest.resetModules();
	jest.doMock( '../capture', captureModule );

	const { captureCanvas } = await import( '..' );
	const { recordBigSkyTracksEvent } = await import( '../../tracks' );

	return { captureCanvas, recordEvent: jest.mocked( recordBigSkyTracksEvent ) };
}

afterEach( () => {
	jest.dontMock( '../capture' );
	jest.restoreAllMocks();
} );

it( 'delegates to the lazily loaded capture with the options as given', async () => {
	const captureCanvasFileParts = jest.fn().mockResolvedValue( [ screenshot ] );
	const { captureCanvas, recordEvent } = await load( () => ( { captureCanvasFileParts } ) );

	await expect( captureCanvas( { clientIds: [ 'abc' ], fullPage: true } ) ).resolves.toEqual( [
		screenshot,
	] );

	expect( captureCanvasFileParts ).toHaveBeenCalledWith( { clientIds: [ 'abc' ], fullPage: true } );
	expect( recordEvent ).not.toHaveBeenCalled();
} );

it( 'resolves null and records the capture as unavailable when the chunk fails to load', async () => {
	// A chunk that 404s must read as "no image", never as a failed edit.
	const error = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	const { captureCanvas, recordEvent } = await load( () => {
		throw new Error( 'Chunk failed.' );
	} );

	await expect( captureCanvas( { fullPage: true } ) ).resolves.toBeNull();

	expect( recordEvent ).toHaveBeenCalledWith( 'jetpack_big_sky_canvas_capture_failed', {
		reason: 'unavailable',
		full_page: true,
	} );
	expect( error ).toHaveBeenCalled();
} );
