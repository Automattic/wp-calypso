/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import wpcom from 'calypso/lib/wp';
import { useImageUploads } from '../use-image-uploads';

jest.mock( '../compress-image', () => ( {
	compressImage: jest.fn( async () => ( {
		blob: new Blob( [ 'compressed' ], { type: 'image/jpeg' } ),
		width: 1000,
		height: 750,
		size: 'compressed'.length,
	} ) ),
	CompressionFailedError: class extends Error {},
} ) );

function wrap( queryClient: QueryClient ) {
	return ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
}

describe( 'useImageUploads', () => {
	beforeAll( () => {
		// jsdom does not implement URL.createObjectURL / revokeObjectURL.
		Object.defineProperty( URL, 'createObjectURL', {
			configurable: true,
			value: jest.fn( () => 'blob:mock' ),
		} );
		Object.defineProperty( URL, 'revokeObjectURL', {
			configurable: true,
			value: jest.fn(),
		} );
	} );

	afterEach( () => jest.restoreAllMocks() );

	it( 'transitions a picked file through compressing → uploading → uploaded', async () => {
		// Mirrors `uploadBlobMutation` factory tests: nock can't drive the
		// upload path because superagent's Node adapter streams FormData via
		// `form-data`, which rejects jsdom Blob/File instances before any
		// HTTP request goes out. Spying on `wpcom.req.post` keeps the hook's
		// state-machine wiring under test without taking on the transport's
		// stream plumbing.
		jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( {
			blob: {
				$type: 'blob',
				ref: { $link: 'bafkrei' + 'a'.repeat( 50 ) },
				mimeType: 'image/jpeg',
				size: 10,
			},
		} );

		const qc = new QueryClient();
		const { result } = renderHook( () => useImageUploads( { connectionId: 9, max: 4 } ), {
			wrapper: wrap( qc ),
		} );

		const file = new File( [ 'src' ], 'a.png', { type: 'image/png' } );
		await act( async () => {
			await result.current.addFiles( [ file ] );
		} );

		await waitFor( () => {
			expect( result.current.images ).toHaveLength( 1 );
			expect( result.current.images[ 0 ].kind ).toBe( 'uploaded' );
		} );

		const uploaded = result.current.images[ 0 ];
		if ( uploaded.kind !== 'uploaded' ) {
			throw new Error( 'expected uploaded' );
		}
		expect( uploaded.aspectRatio ).toEqual( { width: 1000, height: 750 } );
		expect( uploaded.blob.mimeType ).toBe( 'image/jpeg' );
	} );

	it( 'enforces the cap across concurrent addFiles calls', async () => {
		// Two rapid `addFiles` calls (mobile share sheet, double-tap) must
		// not both capture the same `images.length` and admit more files
		// than `max`. Without a synchronous slot reservation, the second
		// call would slice against a stale count and overflow the cap.
		jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( {
			blob: {
				$type: 'blob',
				ref: { $link: 'bafkrei' + 'a'.repeat( 50 ) },
				mimeType: 'image/jpeg',
				size: 10,
			},
		} );

		const qc = new QueryClient();
		const { result } = renderHook( () => useImageUploads( { connectionId: 9, max: 4 } ), {
			wrapper: wrap( qc ),
		} );

		const batchA = [
			new File( [ 'a' ], 'a.png', { type: 'image/png' } ),
			new File( [ 'b' ], 'b.png', { type: 'image/png' } ),
			new File( [ 'c' ], 'c.png', { type: 'image/png' } ),
			new File( [ 'd' ], 'd.png', { type: 'image/png' } ),
		];
		const batchB = [ new File( [ 'e' ], 'e.png', { type: 'image/png' } ) ];

		await act( async () => {
			await Promise.all( [ result.current.addFiles( batchA ), result.current.addFiles( batchB ) ] );
		} );

		await waitFor( () => {
			expect( result.current.images.every( ( i ) => i.kind === 'uploaded' ) ).toBe( true );
		} );
		expect( result.current.images.length ).toBeLessThanOrEqual( 4 );
		expect( result.current.images.length ).toBe( 4 );
	} );

	it( 'narrows non-AtmosphereError throws to { kind: "unknown" }', async () => {
		// `uploadBlob` normally classifies its rejections through
		// `classifyAtmosphereError`, but a transport-level failure (network
		// drop, abort) can short-circuit before that runs. Casting `err as
		// AtmosphereError` would let downstream `error.kind` reads return
		// `undefined`; the type guard collapses anything unrecognized to
		// `{ kind: 'unknown', cause: err }`.
		jest.spyOn( wpcom.req, 'post' ).mockRejectedValue( new Error( 'network down' ) );

		const qc = new QueryClient();
		const { result } = renderHook( () => useImageUploads( { connectionId: 9, max: 4 } ), {
			wrapper: wrap( qc ),
		} );

		const file = new File( [ 'src' ], 'a.png', { type: 'image/png' } );
		await act( async () => {
			await result.current.addFiles( [ file ] );
		} );

		await waitFor( () => {
			expect( result.current.images[ 0 ]?.kind ).toBe( 'failed' );
		} );

		const failed = result.current.images[ 0 ];
		if ( failed.kind !== 'failed' ) {
			throw new Error( 'expected failed' );
		}
		expect( failed.error.kind ).toBe( 'unknown' );
	} );
} );
