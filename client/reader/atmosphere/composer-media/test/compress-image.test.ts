/**
 * @jest-environment jsdom
 */
import { compressImage, CompressionFailedError } from '../compress-image';

describe( 'compressImage', () => {
	let toBlobSpy: jest.SpyInstance;

	beforeEach( () => {
		// Force <canvas> fallback (jest-canvas-mock polyfills HTMLCanvasElement,
		// not OffscreenCanvas).
		// @ts-expect-error - intentional cleanup of any prior polyfill.
		delete global.OffscreenCanvas;

		// Polyfill createImageBitmap to return a fake bitmap whose dimensions
		// are encoded in the source File's name (e.g. "synth-4000x2000.png").
		global.createImageBitmap = jest.fn( async ( source: ImageBitmapSource ) => {
			const name = ( source as File ).name ?? '';
			const match = name.match( /(\d+)x(\d+)/ );
			const width = match ? parseInt( match[ 1 ], 10 ) : 1200;
			const height = match ? parseInt( match[ 2 ], 10 ) : 800;
			// `new ImageBitmap()` isn't constructible — fabricate an instance whose
			// prototype satisfies `instanceof ImageBitmap` (jest-canvas-mock's
			// `drawImage` checks via `instanceof`).
			const bitmap = Object.assign( Object.create( ImageBitmap.prototype ) as ImageBitmap, {
				width,
				height,
				close: () => {},
			} );
			return bitmap;
		} ) as typeof createImageBitmap;
	} );

	afterEach( () => {
		toBlobSpy?.mockRestore();
		// @ts-expect-error - cleanup global polyfill.
		delete global.createImageBitmap;
	} );

	function mockToBlobBySize( sizeFromQuality: ( quality: number ) => number ) {
		toBlobSpy = jest.spyOn( HTMLCanvasElement.prototype, 'toBlob' ).mockImplementation( function (
			this: HTMLCanvasElement,
			cb: BlobCallback,
			_type?: string,
			quality?: number
		) {
			const q = quality ?? 1;
			const size = Math.max( 1, Math.round( sizeFromQuality( q ) ) );
			const blob = new Blob( [ new Uint8Array( size ) ], { type: 'image/jpeg' } );
			cb( blob );
		} );
	}

	it( 'returns a JPEG blob with width/height under 2000 and size under 1MB', async () => {
		// Quality-dependent payload that crosses 1MB inside the search range.
		mockToBlobBySize( ( q ) => 200_000 + 1_500_000 * q );

		const file = new File( [ new Uint8Array( 10 ) ], 'synth-1200x800.png', {
			type: 'image/png',
		} );

		const result = await compressImage( file );

		expect( result.blob ).toBeInstanceOf( Blob );
		expect( result.blob.type ).toBe( 'image/jpeg' );
		expect( result.width ).toBeLessThanOrEqual( 2000 );
		expect( result.height ).toBeLessThanOrEqual( 2000 );
		expect( result.size ).toBeLessThanOrEqual( 1_000_000 );
		expect( result.size ).toBe( result.blob.size );
	} );

	it( 'preserves aspect ratio when downscaling 4000x2000 to 2000x1000', async () => {
		mockToBlobBySize( () => 100_000 );

		const file = new File( [ new Uint8Array( 10 ) ], 'synth-4000x2000.png', {
			type: 'image/png',
		} );

		const result = await compressImage( file );

		expect( result.width ).toBe( 2000 );
		expect( result.height ).toBe( 1000 );
	} );

	it( 'rejects with CompressionFailedError when maxBytes is impossibly small', async () => {
		// Always larger than maxBytes regardless of quality.
		mockToBlobBySize( () => 50_000 );

		const file = new File( [ new Uint8Array( 10 ) ], 'synth-1200x800.png', {
			type: 'image/png',
		} );

		await expect( compressImage( file, { maxBytes: 1 } ) ).rejects.toBeInstanceOf(
			CompressionFailedError
		);
	} );
} );
