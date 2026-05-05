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
} );
