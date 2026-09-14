/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, act, screen } from '@testing-library/react';
import { useMastodonComposerMedia } from '../use-mastodon-composer-media';

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

beforeEach( () => {
	URL.createObjectURL = jest.fn( () => 'blob:fake' );
	URL.revokeObjectURL = jest.fn();
} );

const wrap =
	( qc: QueryClient ) =>
	( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ qc }>{ children }</QueryClientProvider>
	);

const standaloneMode = {
	kind: 'standalone' as const,
	connectionId: 7,
	entry_point: 'fab' as const,
};

function makeFile( name: string ): File {
	return new File( [ 'x' ], name, { type: 'image/jpeg' } );
}

describe( 'useMastodonComposerMedia', () => {
	it( 'renderGrid returns null when no images are staged', () => {
		const qc = new QueryClient();
		const { result } = renderHook(
			() => useMastodonComposerMedia( { mode: standaloneMode, connectionId: 7 } ),
			{ wrapper: wrap( qc ) }
		);
		const { container } = render( <>{ result.current.renderGrid() }</> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renderGrid returns MediaGrid + SensitiveToggle when images are staged', () => {
		const qc = new QueryClient();
		const { result } = renderHook(
			() => useMastodonComposerMedia( { mode: standaloneMode, connectionId: 7 } ),
			{ wrapper: wrap( qc ) }
		);
		render( <>{ result.current.renderFooterTrigger() }</> );
		const input = document.querySelector( 'input[type="file"]' ) as HTMLInputElement;
		const f = makeFile( 'a.jpg' );
		Object.defineProperty( input, 'files', { value: [ f ], configurable: true } );
		act( () => {
			input.dispatchEvent( new Event( 'change', { bubbles: true } ) );
		} );

		const { container } = render( <>{ result.current.renderGrid() }</> );
		expect( container.querySelector( '.social-composer__media-grid' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'checkbox', { name: /mark media as sensitive/i } ) ).toBeVisible();
	} );

	it( 'extendBuildParams resolves with media_ids and sensitive when staged images exist', async () => {
		const qc = new QueryClient();
		const { result } = renderHook(
			() => useMastodonComposerMedia( { mode: standaloneMode, connectionId: 7 } ),
			{ wrapper: wrap( qc ) }
		);
		render( <>{ result.current.renderFooterTrigger() }</> );
		const input = document.querySelector( 'input[type="file"]' ) as HTMLInputElement;
		const f = makeFile( 'a.jpg' );
		Object.defineProperty( input, 'files', { value: [ f ], configurable: true } );
		act( () => {
			input.dispatchEvent( new Event( 'change', { bubbles: true } ) );
		} );
		render( <>{ result.current.renderGrid() }</> );
		await act( async () => {
			(
				screen.getByRole( 'checkbox', {
					name: /mark media as sensitive/i,
				} ) as HTMLInputElement
			 ).click();
		} );

		const baseParams = { connectionId: 7, status: 'hello' };
		const out = ( await result.current.extendBuildParams( baseParams ) ) as Record<
			string,
			unknown
		>;
		expect( out ).toMatchObject( {
			connectionId: 7,
			status: 'hello',
			media_ids: [ 'id-a.jpg' ],
			sensitive: true,
		} );
	} );

	it( 'extendBuildParams passes params through unchanged when no images are staged', async () => {
		const qc = new QueryClient();
		const { result } = renderHook(
			() => useMastodonComposerMedia( { mode: standaloneMode, connectionId: 7 } ),
			{ wrapper: wrap( qc ) }
		);
		const baseParams = { connectionId: 7, status: 'hi' };
		const out = await result.current.extendBuildParams( baseParams );
		expect( out ).toEqual( baseParams );
	} );

	it( 'clear revokes preview URLs immediately regardless of keepPreviewUrlsAlive', () => {
		const qc = new QueryClient();
		const { result } = renderHook(
			() => useMastodonComposerMedia( { mode: standaloneMode, connectionId: 7 } ),
			{ wrapper: wrap( qc ) }
		);
		render( <>{ result.current.renderFooterTrigger() }</> );
		const input = document.querySelector( 'input[type="file"]' ) as HTMLInputElement;
		Object.defineProperty( input, 'files', {
			value: [ makeFile( 'a.jpg' ) ],
			configurable: true,
		} );
		act( () => {
			input.dispatchEvent( new Event( 'change', { bubbles: true } ) );
		} );
		act( () => result.current.clear( { keepPreviewUrlsAlive: true } ) );
		expect( URL.revokeObjectURL ).toHaveBeenCalled();
	} );
} );
