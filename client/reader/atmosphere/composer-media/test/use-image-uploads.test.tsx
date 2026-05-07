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

	it( 'fires _compose_media_picked when files are added', async () => {
		jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( okBlobResponse );

		const onTrack = jest.fn();
		const qc = new QueryClient();
		const { result } = renderHook(
			() => useImageUploads( { connectionId: 9, max: 4, mode: 'standalone', onTrack } ),
			{ wrapper: wrap( qc ) }
		);

		const files = [
			new File( [ 'a' ], 'a.png', { type: 'image/png' } ),
			new File( [ 'b' ], 'b.png', { type: 'image/png' } ),
		];
		await act( async () => {
			await result.current.addFiles( files );
		} );

		expect( onTrack ).toHaveBeenCalledWith( 'calypso_reader_atmosphere_compose_media_picked', {
			connection_id: 9,
			count: 2,
			mode: 'standalone',
		} );
	} );

	it( 'fires _compose_media_uploaded with byte totals after all uploads finish', async () => {
		jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( okBlobResponse );

		// Override the default compressImage mock for this test so we
		// can assert specific byte sizes ended up in the event payload.
		const { compressImage } = jest.requireMock( '../compress-image' );
		( compressImage as jest.Mock ).mockResolvedValueOnce( {
			blob: new Blob( [ 'x'.repeat( 25 ) ], { type: 'image/jpeg' } ),
			width: 800,
			height: 600,
			size: 25,
		} );

		const onTrack = jest.fn();
		const qc = new QueryClient();
		const { result } = renderHook(
			() => useImageUploads( { connectionId: 9, max: 4, mode: 'reply', onTrack } ),
			{ wrapper: wrap( qc ) }
		);

		// Source file size: payload 'src-bytes-here' = 14 chars.
		const file = new File( [ 'src-bytes-here' ], 'a.png', { type: 'image/png' } );
		await act( async () => {
			await result.current.addFiles( [ file ] );
		} );

		await waitFor( () => expect( result.current.images[ 0 ].kind ).toBe( 'uploaded' ) );

		expect( onTrack ).toHaveBeenCalledWith( 'calypso_reader_atmosphere_compose_media_uploaded', {
			connection_id: 9,
			count: 1,
			total_bytes_before_compress: 14,
			total_bytes_after_compress: 25,
			mode: 'reply',
		} );
	} );

	it( 'fires _compose_media_upload_error_shown when an upload fails', async () => {
		// Surface any classifier-mapped `error_kind` from the rejected
		// response. The exact shape of the rejection that `uploadBlob`
		// re-throws is exercised in the mutation factory's own tests; here
		// we only need the hook to forward the resulting `error.kind` into
		// the Tracks event once per failed upload.
		jest
			.spyOn( wpcom.req, 'post' )
			.mockRejectedValue( { kind: 'rate_limited', message: 'slow down' } );

		const onTrack = jest.fn();
		const qc = new QueryClient();
		const { result } = renderHook(
			() => useImageUploads( { connectionId: 9, max: 4, mode: 'quote', onTrack } ),
			{ wrapper: wrap( qc ) }
		);

		const file = new File( [ 'src' ], 'a.png', { type: 'image/png' } );
		await act( async () => {
			await result.current.addFiles( [ file ] );
		} );

		await waitFor( () => expect( result.current.images[ 0 ].kind ).toBe( 'failed' ) );

		const failed = result.current.images[ 0 ];
		if ( failed.kind !== 'failed' ) {
			throw new Error( 'expected failed' );
		}
		const errorCalls = onTrack.mock.calls.filter(
			( [ name ] ) => name === 'calypso_reader_atmosphere_compose_media_upload_error_shown'
		);
		expect( errorCalls ).toHaveLength( 1 );
		expect( errorCalls[ 0 ][ 1 ] ).toEqual( {
			connection_id: 9,
			mode: 'quote',
			error_kind: failed.error.kind,
		} );
	} );

	it( 'fires _compose_media_removed with was_uploaded flag', async () => {
		// Scenario 1: full upload then remove → was_uploaded: true.
		jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( okBlobResponse );

		const onTrack = jest.fn();
		const qc = new QueryClient();
		const { result } = renderHook(
			() => useImageUploads( { connectionId: 9, max: 4, mode: 'standalone', onTrack } ),
			{ wrapper: wrap( qc ) }
		);

		const file = new File( [ 'src' ], 'a.png', { type: 'image/png' } );
		await act( async () => {
			await result.current.addFiles( [ file ] );
		} );

		await waitFor( () => expect( result.current.images[ 0 ].kind ).toBe( 'uploaded' ) );

		const uploadedId = result.current.images[ 0 ].localId;
		act( () => result.current.removeImage( uploadedId ) );

		const removedCalls = onTrack.mock.calls.filter(
			( [ name ] ) => name === 'calypso_reader_atmosphere_compose_media_removed'
		);
		expect( removedCalls ).toHaveLength( 1 );
		expect( removedCalls[ 0 ][ 1 ] ).toEqual( {
			connection_id: 9,
			was_uploaded: true,
			mode: 'standalone',
		} );
	} );

	it( 'fires _compose_media_removed with was_uploaded: false when removed during compressing', async () => {
		// `compressImage` returns a never-resolving promise, so the entry
		// stays in `compressing` while we issue `removeImage`. This is
		// the only state where `kind !== 'uploaded'` is reachable
		// synchronously from the test.
		const { compressImage } = jest.requireMock( '../compress-image' );
		( compressImage as jest.Mock ).mockImplementationOnce( () => new Promise( () => {} ) );
		jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( okBlobResponse );

		const onTrack = jest.fn();
		const qc = new QueryClient();
		const { result } = renderHook(
			() => useImageUploads( { connectionId: 9, max: 4, mode: 'standalone', onTrack } ),
			{ wrapper: wrap( qc ) }
		);

		const file = new File( [ 'src' ], 'a.png', { type: 'image/png' } );
		// Don't await — the compressing promise never resolves.
		act( () => {
			void result.current.addFiles( [ file ] );
		} );

		await waitFor( () => expect( result.current.images[ 0 ]?.kind ).toBe( 'compressing' ) );

		const compressingId = result.current.images[ 0 ].localId;
		act( () => result.current.removeImage( compressingId ) );

		const removedCalls = onTrack.mock.calls.filter(
			( [ name ] ) => name === 'calypso_reader_atmosphere_compose_media_removed'
		);
		expect( removedCalls ).toHaveLength( 1 );
		expect( removedCalls[ 0 ][ 1 ].was_uploaded ).toBe( false );
	} );

	it( 'clearAll removes every entry without firing _compose_media_removed', async () => {
		// Composer close-cleanup uses `clearAll` so a user closing the modal
		// doesn't fire one `media_removed` event per attached image — those
		// would all carry stale labels (mode/connection_id snap to defaults
		// once the composer's `mode` flips to null) and aren't meaningful as
		// "user removed an image" events anyway.
		jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( okBlobResponse );

		const onTrack = jest.fn();
		const qc = new QueryClient();
		const { result } = renderHook(
			() => useImageUploads( { connectionId: 9, max: 4, mode: 'standalone', onTrack } ),
			{ wrapper: wrap( qc ) }
		);

		const files = [
			new File( [ 'a' ], 'a.png', { type: 'image/png' } ),
			new File( [ 'b' ], 'b.png', { type: 'image/png' } ),
		];
		await act( async () => {
			await result.current.addFiles( files );
		} );

		await waitFor( () => {
			expect( result.current.images.every( ( i ) => i.kind === 'uploaded' ) ).toBe( true );
		} );

		onTrack.mockClear();
		act( () => result.current.clearAll() );

		expect( result.current.images ).toHaveLength( 0 );
		expect(
			onTrack.mock.calls.filter(
				( [ name ] ) => name === 'calypso_reader_atmosphere_compose_media_removed'
			)
		).toHaveLength( 0 );
	} );

	it( 'clearAll({ deferRevocation: true }) defers preview URL revocation past staleTime', async () => {
		// Post-publish path: the modal patches a local-preview embed onto the
		// just-published feed item, then closes. URL revocation is deferred so
		// the cached embed's `<img src=blob:...>` stays valid past the
		// timeline's 30s staleTime, where the next refetch replaces it with a
		// real CDN URL.
		jest.useFakeTimers();
		try {
			jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( okBlobResponse );

			const qc = new QueryClient();
			const { result } = renderHook( () => useImageUploads( { connectionId: 9, max: 4 } ), {
				wrapper: wrap( qc ),
			} );

			const file = new File( [ 'a' ], 'a.png', { type: 'image/png' } );
			await act( async () => {
				await result.current.addFiles( [ file ] );
			} );
			await waitFor( () =>
				expect( result.current.images.every( ( i ) => i.kind === 'uploaded' ) ).toBe( true )
			);

			( URL.revokeObjectURL as jest.Mock ).mockClear();
			act( () => result.current.clearAll( { deferRevocation: true } ) );

			// Immediate revocation MUST NOT happen — the placeholder embed in
			// the timeline cache still references this URL.
			expect( URL.revokeObjectURL ).not.toHaveBeenCalled();

			// After the deferred timer fires (~60s later, longer than the 30s
			// staleTime), the URL is finally revoked.
			act( () => {
				jest.advanceTimersByTime( 60_000 );
			} );
			expect( URL.revokeObjectURL ).toHaveBeenCalled();
		} finally {
			jest.useRealTimers();
		}
	} );

	it( 'clearAll() (no defer) revokes preview URLs synchronously', async () => {
		// Cancel / discard path keeps the legacy synchronous behavior so URLs
		// are reclaimed the moment the user dismisses the composer without
		// publishing.
		jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( okBlobResponse );

		const qc = new QueryClient();
		const { result } = renderHook( () => useImageUploads( { connectionId: 9, max: 4 } ), {
			wrapper: wrap( qc ),
		} );

		const file = new File( [ 'a' ], 'a.png', { type: 'image/png' } );
		await act( async () => {
			await result.current.addFiles( [ file ] );
		} );
		await waitFor( () =>
			expect( result.current.images.every( ( i ) => i.kind === 'uploaded' ) ).toBe( true )
		);

		( URL.revokeObjectURL as jest.Mock ).mockClear();
		act( () => result.current.clearAll() );
		expect( URL.revokeObjectURL ).toHaveBeenCalled();
	} );

	it( 'skips _compose_media_upload_error_shown when an upload fails after the entry was removed', async () => {
		// User opens composer, picks an image, closes the composer (or hits ×)
		// while the upload is in flight. The transport-level failure
		// (abort / network drop) should NOT fire an analytics event because
		// the `connection_id` / `mode` refs have snapped to their defaults
		// once the composer closed, and the user-perceived action was a
		// remove, not an upload-failure.
		let rejectUpload: ( e: unknown ) => void = () => {};
		jest.spyOn( wpcom.req, 'post' ).mockImplementation(
			() =>
				new Promise( ( _resolve, reject ) => {
					rejectUpload = reject;
				} )
		);

		const onTrack = jest.fn();
		const qc = new QueryClient();
		const { result } = renderHook(
			() => useImageUploads( { connectionId: 9, max: 4, mode: 'standalone', onTrack } ),
			{ wrapper: wrap( qc ) }
		);

		const file = new File( [ 'a' ], 'a.png', { type: 'image/png' } );
		await act( async () => {
			void result.current.addFiles( [ file ] );
		} );
		await waitFor( () => expect( result.current.images[ 0 ]?.kind ).toBe( 'uploading' ) );

		const id = result.current.images[ 0 ].localId;
		act( () => result.current.removeImage( id ) );

		await act( async () => {
			rejectUpload( { kind: 'unknown', cause: new Error( 'aborted' ) } );
			// Flush microtasks so the catch arm runs.
			await Promise.resolve();
		} );

		expect( result.current.images ).toHaveLength( 0 );
		const errorCalls = onTrack.mock.calls.filter(
			( [ name ] ) => name === 'calypso_reader_atmosphere_compose_media_upload_error_shown'
		);
		expect( errorCalls ).toHaveLength( 0 );
	} );

	it( 'retryImage does not fire _compose_media_removed', async () => {
		// `retryImage` internally drops the failed entry and re-enters the
		// upload pipeline with the same source file. The user clicked Retry,
		// not ×, so `media_removed` would be wrong analytics — the entry
		// hasn't been "removed" from the user's perspective, it's being
		// retried.
		jest
			.spyOn( wpcom.req, 'post' )
			.mockRejectedValueOnce( { kind: 'unknown', cause: new Error( 'down' ) } )
			.mockResolvedValueOnce( okBlobResponse );

		const onTrack = jest.fn();
		const qc = new QueryClient();
		const { result } = renderHook(
			() => useImageUploads( { connectionId: 9, max: 4, mode: 'standalone', onTrack } ),
			{ wrapper: wrap( qc ) }
		);

		const file = new File( [ 'src' ], 'a.png', { type: 'image/png' } );
		await act( async () => {
			await result.current.addFiles( [ file ] );
		} );

		await waitFor( () => expect( result.current.images[ 0 ].kind ).toBe( 'failed' ) );

		const failedId = result.current.images[ 0 ].localId;
		onTrack.mockClear();
		await act( async () => {
			await result.current.retryImage( failedId );
		} );

		await waitFor( () => {
			expect( result.current.images[ 0 ].kind ).toBe( 'uploaded' );
		} );

		expect(
			onTrack.mock.calls.filter(
				( [ name ] ) => name === 'calypso_reader_atmosphere_compose_media_removed'
			)
		).toHaveLength( 0 );
	} );

	it( 'fires _compose_alt_text_added with length only (never the text)', async () => {
		jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( okBlobResponse );

		const onTrack = jest.fn();
		const qc = new QueryClient();
		const { result } = renderHook(
			() => useImageUploads( { connectionId: 9, max: 4, mode: 'standalone', onTrack } ),
			{ wrapper: wrap( qc ) }
		);

		const file = new File( [ 'src' ], 'a.png', { type: 'image/png' } );
		await act( async () => {
			await result.current.addFiles( [ file ] );
		} );
		await waitFor( () => expect( result.current.images[ 0 ].kind ).toBe( 'uploaded' ) );

		const id = result.current.images[ 0 ].localId;
		act( () => result.current.setAlt( id, 'hello world' ) );

		const altCalls = onTrack.mock.calls.filter(
			( [ name ] ) => name === 'calypso_reader_atmosphere_compose_alt_text_added'
		);
		expect( altCalls ).toHaveLength( 1 );
		const props = altCalls[ 0 ][ 1 ];
		expect( props ).toEqual( {
			connection_id: 9,
			mode: 'standalone',
			length: 11,
		} );
		expect( props ).not.toHaveProperty( 'text' );

		// Subsequent edits (still non-empty) must NOT fire again.
		act( () => result.current.setAlt( id, 'hello world!' ) );
		expect(
			onTrack.mock.calls.filter(
				( [ name ] ) => name === 'calypso_reader_atmosphere_compose_alt_text_added'
			)
		).toHaveLength( 1 );
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
