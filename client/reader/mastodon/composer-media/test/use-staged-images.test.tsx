/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';
import { useStagedImages } from '../use-staged-images';

jest.mock( '@automattic/api-queries', () => {
	const actual = jest.requireActual( '@automattic/api-queries' );
	return {
		...actual,
		uploadMastodonMediaMutation: jest.fn( () => ( {
			mutationFn: jest.fn( async ( { file } ) => ( {
				id: `id-${ ( file as File ).name }`,
				type: 'image',
				url: 'u',
				preview_url: 'p',
				description: '',
			} ) ),
		} ) ),
	};
} );

const wrap =
	( qc: QueryClient ) =>
	( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ qc }>{ children }</QueryClientProvider>
	);

function makeFile( name: string, type: string, size = 1000 ): File {
	const blob = new Blob( [ 'x'.repeat( size ) ], { type } );
	return new File( [ blob ], name, { type } );
}

beforeEach( () => {
	const urls = new Set< string >();
	URL.createObjectURL = jest.fn( () => {
		const id = `blob:${ Math.random().toString( 36 ).slice( 2 ) }`;
		urls.add( id );
		return id;
	} );
	URL.revokeObjectURL = jest.fn( ( u ) => urls.delete( u ) );
} );

describe( 'useStagedImages', () => {
	it( 'stages valid files', () => {
		const qc = new QueryClient();
		const { result } = renderHook( () => useStagedImages( { max: 4 } ), {
			wrapper: wrap( qc ),
		} );
		const f = makeFile( 'a.jpg', 'image/jpeg' );
		act( () => result.current.addFiles( [ f ] ) );
		expect( result.current.images ).toHaveLength( 1 );
		expect( result.current.images[ 0 ].kind ).toBe( 'staged' );
	} );

	it( 'rejects oversized files with reason: too_large', () => {
		const qc = new QueryClient();
		const { result } = renderHook( () => useStagedImages( { max: 4 } ), {
			wrapper: wrap( qc ),
		} );
		const big = makeFile( 'big.jpg', 'image/jpeg', 9_000_000 );
		act( () => result.current.addFiles( [ big ] ) );
		expect( result.current.images[ 0 ] ).toMatchObject( {
			kind: 'failed',
			reason: 'too_large',
		} );
	} );

	it( 'rejects unsupported MIME with reason: unsupported_type', () => {
		const qc = new QueryClient();
		const { result } = renderHook( () => useStagedImages( { max: 4 } ), {
			wrapper: wrap( qc ),
		} );
		const bad = makeFile( 'a.heic', 'image/heic' );
		act( () => result.current.addFiles( [ bad ] ) );
		expect( result.current.images[ 0 ] ).toMatchObject( {
			kind: 'failed',
			reason: 'unsupported_type',
		} );
	} );

	it( 'enforces max cap across multiple addFiles calls', () => {
		const qc = new QueryClient();
		const { result } = renderHook( () => useStagedImages( { max: 2 } ), {
			wrapper: wrap( qc ),
		} );
		act( () =>
			result.current.addFiles( [
				makeFile( 'a.jpg', 'image/jpeg' ),
				makeFile( 'b.jpg', 'image/jpeg' ),
				makeFile( 'c.jpg', 'image/jpeg' ),
			] )
		);
		expect( result.current.images ).toHaveLength( 2 );
	} );

	it( 'removeImage drops the entry and revokes the preview URL', () => {
		const qc = new QueryClient();
		const { result } = renderHook( () => useStagedImages( { max: 4 } ), {
			wrapper: wrap( qc ),
		} );
		act( () => result.current.addFiles( [ makeFile( 'a.jpg', 'image/jpeg' ) ] ) );
		const id = result.current.images[ 0 ].localId;
		const url = result.current.images[ 0 ].previewUrl;
		act( () => result.current.removeImage( id ) );
		expect( result.current.images ).toHaveLength( 0 );
		expect( URL.revokeObjectURL ).toHaveBeenCalledWith( url );
	} );

	it( 'setAlt updates the alt text on a staged item', () => {
		const qc = new QueryClient();
		const { result } = renderHook( () => useStagedImages( { max: 4 } ), {
			wrapper: wrap( qc ),
		} );
		act( () => result.current.addFiles( [ makeFile( 'a.jpg', 'image/jpeg' ) ] ) );
		const id = result.current.images[ 0 ].localId;
		act( () => result.current.setAlt( id, 'a cat' ) );
		expect( result.current.images[ 0 ].alt ).toBe( 'a cat' );
	} );

	it( 'retryImage moves a failed entry back to staged when the file revalidates', () => {
		const qc = new QueryClient();
		const { result } = renderHook( () => useStagedImages( { max: 4 } ), {
			wrapper: wrap( qc ),
		} );
		const big = makeFile( 'big.jpg', 'image/jpeg', 9_000_000 );
		act( () => result.current.addFiles( [ big ] ) );
		const id = result.current.images[ 0 ].localId;
		act( () => result.current.retryImage( id ) );
		// Same file fails again — still failed (the file didn't change).
		expect( result.current.images[ 0 ].kind ).toBe( 'failed' );
	} );

	it( 'clearAll empties the array and revokes preview URLs', () => {
		const qc = new QueryClient();
		const { result } = renderHook( () => useStagedImages( { max: 4 } ), {
			wrapper: wrap( qc ),
		} );
		act( () =>
			result.current.addFiles( [
				makeFile( 'a.jpg', 'image/jpeg' ),
				makeFile( 'b.jpg', 'image/jpeg' ),
			] )
		);
		act( () => result.current.clearAll() );
		expect( result.current.images ).toHaveLength( 0 );
		expect( URL.revokeObjectURL ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'uploadAllNow uploads each staged image in parallel and returns media_ids in stable order', async () => {
		const qc = new QueryClient();
		const { result } = renderHook( () => useStagedImages( { max: 4 } ), {
			wrapper: wrap( qc ),
		} );
		act( () =>
			result.current.addFiles( [
				makeFile( 'a.jpg', 'image/jpeg' ),
				makeFile( 'b.jpg', 'image/jpeg' ),
			] )
		);
		const out = await act( async () => result.current.uploadAllNow( 7 ) );
		expect( out ).toEqual( { media_ids: [ 'id-a.jpg', 'id-b.jpg' ] } );
	} );

	it( 'uploadAllNow rejects with the underlying error when any single upload fails', async () => {
		const { uploadMastodonMediaMutation } = await import( '@automattic/api-queries' );
		( uploadMastodonMediaMutation as jest.Mock ).mockReturnValueOnce( {
			mutationFn: jest.fn( async ( { file } ) =>
				( file as File ).name === 'b.jpg'
					? Promise.reject( { kind: 'media_too_large' } )
					: { id: 'id-a', type: 'image', url: 'u', preview_url: 'p', description: '' }
			),
		} );
		const qc = new QueryClient();
		const { result } = renderHook( () => useStagedImages( { max: 4 } ), {
			wrapper: wrap( qc ),
		} );
		act( () =>
			result.current.addFiles( [
				makeFile( 'a.jpg', 'image/jpeg' ),
				makeFile( 'b.jpg', 'image/jpeg' ),
			] )
		);
		await expect( result.current.uploadAllNow( 7 ) ).rejects.toMatchObject( {
			kind: 'media_too_large',
		} );
	} );

	it( 'sensitive defaults to false; setSensitive flips it', () => {
		const qc = new QueryClient();
		const { result } = renderHook( () => useStagedImages( { max: 4 } ), {
			wrapper: wrap( qc ),
		} );
		expect( result.current.sensitive ).toBe( false );
		act( () => result.current.setSensitive( true ) );
		expect( result.current.sensitive ).toBe( true );
	} );

	it( 'clearAll resets sensitive to false', () => {
		const qc = new QueryClient();
		const { result } = renderHook( () => useStagedImages( { max: 4 } ), {
			wrapper: wrap( qc ),
		} );
		act( () => {
			result.current.setSensitive( true );
			result.current.clearAll();
		} );
		expect( result.current.sensitive ).toBe( false );
	} );

	describe( 'submission flags', () => {
		it( 'with no images: hasAny=false, isAllUploaded=true (vacuously), so text-only posts can submit', () => {
			const qc = new QueryClient();
			const { result } = renderHook( () => useStagedImages( { max: 4 } ), {
				wrapper: wrap( qc ),
			} );
			expect( result.current.hasAny ).toBe( false );
			expect( result.current.hasUploaded ).toBe( false );
			expect( result.current.isAllUploaded ).toBe( true );
			expect( result.current.isAnyPending ).toBe( false );
		} );

		it( 'with all staged images: hasUploaded=true, isAllUploaded=true (lazy upload, ready to submit)', () => {
			const qc = new QueryClient();
			const { result } = renderHook( () => useStagedImages( { max: 4 } ), {
				wrapper: wrap( qc ),
			} );
			act( () => result.current.addFiles( [ makeFile( 'a.jpg', 'image/jpeg' ) ] ) );
			expect( result.current.hasAny ).toBe( true );
			expect( result.current.hasUploaded ).toBe( true );
			expect( result.current.isAllUploaded ).toBe( true );
		} );

		it( 'with a failed image: isAllUploaded=false (blocks submission)', () => {
			const qc = new QueryClient();
			const { result } = renderHook( () => useStagedImages( { max: 4 } ), {
				wrapper: wrap( qc ),
			} );
			act( () => result.current.addFiles( [ makeFile( 'a.heic', 'image/heic' ) ] ) );
			expect( result.current.hasAny ).toBe( true );
			expect( result.current.isAllUploaded ).toBe( false );
		} );
	} );
} );
