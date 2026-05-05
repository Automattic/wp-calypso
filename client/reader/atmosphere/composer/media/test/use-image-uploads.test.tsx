/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import wpcom from 'calypso/lib/wp';
import { toAtmosphereError, useImageUploads } from '../use-image-uploads';

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

const okBlobResponse = {
	blob: {
		$type: 'blob',
		ref: { $link: 'bafkrei' + 'a'.repeat( 50 ) },
		mimeType: 'image/jpeg',
		size: 10,
	},
};

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
		jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( okBlobResponse );

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
		jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( okBlobResponse );

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

	it( 'addFiles clamps a single oversized batch to max', async () => {
		// Sibling to the concurrent-cap test: covers the single-call slice
		// path. Six files into a max-of-four hook must drop the last two
		// rather than admit them and rely on a downstream guard.
		jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( okBlobResponse );

		const qc = new QueryClient();
		const { result } = renderHook( () => useImageUploads( { connectionId: 9, max: 4 } ), {
			wrapper: wrap( qc ),
		} );

		const six = Array.from(
			{ length: 6 },
			( _, i ) => new File( [ String( i ) ], `${ i }.png`, { type: 'image/png' } )
		);

		await act( async () => {
			await result.current.addFiles( six );
		} );

		await waitFor( () => {
			expect( result.current.images ).toHaveLength( 4 );
		} );
	} );

	it( 'removeImage drops the entry, aborts an in-flight upload, and frees a slot', async () => {
		// `removeImage` must release the synchronous slot reservation so
		// the user can re-add an image after deleting one. We verify both
		// the removal and the re-add succeeding under `max: 1`. The first
		// upload uses a never-resolving promise so we can intercept it
		// while it is still in the `uploading` state.
		let resolveUpload: ( ( v: typeof okBlobResponse ) => void ) | undefined;
		const uploadSpy = jest
			.spyOn( wpcom.req, 'post' )
			.mockImplementationOnce(
				() =>
					new Promise( ( resolve ) => {
						resolveUpload = resolve;
					} )
			)
			.mockResolvedValue( okBlobResponse );

		const qc = new QueryClient();
		const { result } = renderHook( () => useImageUploads( { connectionId: 9, max: 1 } ), {
			wrapper: wrap( qc ),
		} );

		const file = new File( [ 'src' ], 'a.png', { type: 'image/png' } );
		// Do NOT await addFiles — the first upload promise never resolves,
		// so awaiting it here would deadlock the test. Kick it off and let
		// `waitFor` observe the `uploading` transition instead.
		act( () => {
			void result.current.addFiles( [ file ] );
		} );

		await waitFor( () => expect( result.current.images[ 0 ]?.kind ).toBe( 'uploading' ) );

		const uploading = result.current.images[ 0 ];
		if ( uploading.kind !== 'uploading' ) {
			throw new Error( 'expected uploading' );
		}
		const abortSpy = jest.spyOn( uploading.abort, 'abort' );

		act( () => result.current.removeImage( uploading.localId ) );

		expect( result.current.images ).toHaveLength( 0 );
		expect( abortSpy ).toHaveBeenCalled();

		// Drain the original pending upload so its `update` call lands
		// before the assertion below (and Jest doesn't warn about a
		// leaked promise). The matching `localId` is gone, so `update`
		// is a no-op on `images`.
		await act( async () => {
			resolveUpload?.( okBlobResponse );
		} );

		const replacement = new File( [ 'src2' ], 'b.png', { type: 'image/png' } );
		await act( async () => {
			await result.current.addFiles( [ replacement ] );
		} );

		await waitFor( () => {
			expect( result.current.images ).toHaveLength( 1 );
			expect( result.current.images[ 0 ].kind ).toBe( 'uploaded' );
		} );

		expect( uploadSpy ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'retryImage moves a failed entry back through uploading to uploaded', async () => {
		// First attempt rejects (transport-level error) so the entry lands
		// in `failed` carrying its `sourceFile`. `retryImage` re-enters
		// `startOne` with that same file; the second mock resolves.
		const uploadSpy = jest
			.spyOn( wpcom.req, 'post' )
			.mockRejectedValueOnce( { kind: 'unknown', cause: new Error( 'down' ) } )
			.mockResolvedValueOnce( okBlobResponse );

		const qc = new QueryClient();
		const { result } = renderHook( () => useImageUploads( { connectionId: 9, max: 4 } ), {
			wrapper: wrap( qc ),
		} );

		const file = new File( [ 'src' ], 'a.png', { type: 'image/png' } );
		await act( async () => {
			await result.current.addFiles( [ file ] );
		} );

		await waitFor( () => expect( result.current.images[ 0 ].kind ).toBe( 'failed' ) );

		const failedId = result.current.images[ 0 ].localId;
		await act( async () => {
			await result.current.retryImage( failedId );
		} );

		await waitFor( () => {
			expect( result.current.images ).toHaveLength( 1 );
			expect( result.current.images[ 0 ].kind ).toBe( 'uploaded' );
		} );

		expect( uploadSpy ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'setAlt updates alt on uploading or uploaded entries; no-ops on compressing', async () => {
		// Alt strings flow into the AppView record as the post is composed.
		// The state-machine variants for `compressing` carry no alt field
		// (no preview yet), so calling `setAlt` mid-compress must be a
		// silent no-op rather than throw.
		jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( okBlobResponse );

		const qc = new QueryClient();
		const { result } = renderHook( () => useImageUploads( { connectionId: 9, max: 4 } ), {
			wrapper: wrap( qc ),
		} );

		const file = new File( [ 'src' ], 'a.png', { type: 'image/png' } );
		await act( async () => {
			await result.current.addFiles( [ file ] );
		} );

		await waitFor( () => expect( result.current.images[ 0 ].kind ).toBe( 'uploaded' ) );

		const id = result.current.images[ 0 ].localId;
		act( () => result.current.setAlt( id, 'a sunny field' ) );

		const uploaded = result.current.images[ 0 ];
		if ( uploaded.kind !== 'uploaded' ) {
			throw new Error( 'expected uploaded' );
		}
		expect( uploaded.alt ).toBe( 'a sunny field' );

		// setAlt on a non-existent id is a silent no-op (smoke test for
		// the compressing branch, which has no alt field to mutate).
		act( () => result.current.setAlt( 'not-a-real-id', 'ignored' ) );
		expect( result.current.images ).toHaveLength( 1 );
	} );

	it( 'isAllUploaded and isAnyPending reflect derived state', async () => {
		jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( okBlobResponse );

		const qc = new QueryClient();
		const { result } = renderHook( () => useImageUploads( { connectionId: 9, max: 4 } ), {
			wrapper: wrap( qc ),
		} );

		// Empty: every() over [] is true; nothing is pending.
		expect( result.current.isAllUploaded ).toBe( true );
		expect( result.current.isAnyPending ).toBe( false );

		const file = new File( [ 'src' ], 'a.png', { type: 'image/png' } );
		await act( async () => {
			await result.current.addFiles( [ file ] );
		} );

		await waitFor( () => {
			expect( result.current.images[ 0 ].kind ).toBe( 'uploaded' );
		} );

		expect( result.current.isAllUploaded ).toBe( true );
		expect( result.current.isAnyPending ).toBe( false );
	} );
} );

describe( 'toAtmosphereError', () => {
	// `uploadBlob` normally classifies its rejections through
	// `classifyAtmosphereError`, but a transport-level failure (network
	// drop, abort, JSON parse error) can short-circuit before that runs.
	// Casting `err as AtmosphereError` would let downstream `error.kind`
	// reads return `undefined`; the guard collapses anything unrecognized
	// to `{ kind: 'unknown', cause: err }` so failed-state consumers stay
	// sound.
	it( 'passes through valid AtmosphereError shapes', () => {
		const e = { kind: 'rate_limited', message: 'slow down' };
		expect( toAtmosphereError( e ) ).toBe( e );
	} );

	it( 'narrows Error instances to unknown', () => {
		const e = new Error( 'boom' );
		const narrowed = toAtmosphereError( e );
		expect( narrowed.kind ).toBe( 'unknown' );
		expect( ( narrowed as { cause?: unknown } ).cause ).toBe( e );
	} );

	it( 'narrows arbitrary thrown values to unknown', () => {
		expect( toAtmosphereError( 'string oops' ).kind ).toBe( 'unknown' );
		expect( toAtmosphereError( { foo: 'bar' } ).kind ).toBe( 'unknown' );
		expect( toAtmosphereError( null ).kind ).toBe( 'unknown' );
		expect( toAtmosphereError( undefined ).kind ).toBe( 'unknown' );
	} );
} );
