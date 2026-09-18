import { getCanvasDocument } from '../../editor-canvas';
import { recordBigSkyTracksEvent } from '../../tracks';
import { captureCanvasFileParts } from '../capture';
import { rasterizeCanvas, UnfaithfulCaptureError } from '../rasterizer';
import type { FilePart } from '../capture';

jest.mock( '../../editor-canvas', () => ( { getCanvasDocument: jest.fn() } ) );
jest.mock( '../../tracks', () => ( { recordBigSkyTracksEvent: jest.fn() } ) );
jest.mock( '../rasterizer', () => ( {
	...jest.requireActual( '../rasterizer' ),
	rasterizeCanvas: jest.fn(),
} ) );

const mockGetCanvasDocument = jest.mocked( getCanvasDocument );
const mockRasterizeCanvas = jest.mocked( rasterizeCanvas );
const mockRecordEvent = jest.mocked( recordBigSkyTracksEvent );

const screenshot: FilePart = {
	type: 'file',
	file: { name: 'canvas.webp', mimeType: 'image/webp', bytes: 'AAAA' },
};

// Reset, not cleared: the canvas is re-armed here and the rasterizer per test.
beforeEach( () => {
	jest.resetAllMocks();
	mockGetCanvasDocument.mockReturnValue( document );
} );

it.each( [
	[ 'no canvas is mounted', null ],
	// A document without a browsing context has no window to measure against.
	[ 'the canvas has no window', document.implementation.createHTMLDocument() ],
] )( 'is null without rasterizing or recording when %s', async ( _name, canvasDocument ) => {
	// A non-editor screen has no canvas, and the editor has none briefly during
	// boot. Neither is a failure; counting them would drown the signal.
	mockGetCanvasDocument.mockReturnValue( canvasDocument );

	await expect( captureCanvasFileParts() ).resolves.toBeNull();

	expect( mockRasterizeCanvas ).not.toHaveBeenCalled();
	expect( mockRecordEvent ).not.toHaveBeenCalled();
} );

it( 'hands the live canvas and the crop hints to the rasterizer and returns its parts', async () => {
	mockRasterizeCanvas.mockResolvedValue( [ screenshot ] );

	await expect(
		captureCanvasFileParts( { clientIds: [ 'abc' ], fullPage: true } )
	).resolves.toEqual( [ screenshot ] );

	expect( mockRasterizeCanvas ).toHaveBeenCalledWith( {
		canvasDocument: document,
		canvasWindow: window,
		clientIds: [ 'abc' ],
		fullPage: true,
	} );
	expect( mockRecordEvent ).not.toHaveBeenCalled();
} );

it( 'defaults to the current view of the page', async () => {
	mockRasterizeCanvas.mockResolvedValue( [ screenshot ] );

	await captureCanvasFileParts();

	expect( mockRasterizeCanvas ).toHaveBeenCalledWith(
		expect.objectContaining( { clientIds: [], fullPage: false } )
	);
} );

it.each( [
	[ 'nothing', null ],
	[ 'no parts', [] ],
] )(
	'records an empty capture, separately from a refusal, when the rasterizer returns %s',
	async ( _name, result ) => {
		mockRasterizeCanvas.mockResolvedValue( result );

		await expect( captureCanvasFileParts( { fullPage: true } ) ).resolves.toBeNull();

		expect( mockRecordEvent ).toHaveBeenCalledWith( 'jetpack_big_sky_canvas_capture_failed', {
			reason: 'empty',
			full_page: true,
		} );
	}
);

it.each( [
	// The refusal reason, not the message: that carries stylesheet hrefs and
	// font URLs, which are unusable as an analytics property.
	[
		'the refusal reason of a typed error',
		new UnfaithfulCaptureError( 'Could not read stylesheet https://…', 'stylesheet' ),
		'stylesheet',
	],
	[ 'a generic reason for an untyped error', new Error( 'something else' ), 'error' ],
] )( 'swallows a failed capture and records %s', async ( _name, error, reason ) => {
	// A failed capture must not turn a successful edit into a failed tool call.
	mockRasterizeCanvas.mockRejectedValue( error );

	await expect( captureCanvasFileParts() ).resolves.toBeNull();

	expect( mockRecordEvent ).toHaveBeenCalledWith( 'jetpack_big_sky_canvas_capture_failed', {
		reason,
		full_page: false,
	} );
} );
