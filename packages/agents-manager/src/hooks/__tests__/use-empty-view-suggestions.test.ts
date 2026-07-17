/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
const mockUseSelect = jest.fn();
let mockContext = {
	sectionName: 'gutenberg',
	currentRoute: undefined as string | undefined,
};
let mockCurrentPostType: string | undefined;

jest.mock( '@wordpress/data', () => ( {
	useSelect: (
		mapSelect: ( select: ( storeName: string ) => unknown ) => unknown,
		deps: unknown[]
	) => mockUseSelect( mapSelect, deps ),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: () => mockContext,
} ) );

import { renderHook, waitFor } from '@testing-library/react';
import { useEmptyViewSuggestions } from '../use-empty-view-suggestions';
import type { LoadedProviders } from '../../utils/load-external-providers';

const readerSuggestion = {
	id: 'reader-summary',
	label: 'Summarize this post',
	prompt: 'Can you summarize this post?',
};

const bigSkySuggestion = {
	id: 'big-sky',
	label: 'Big Sky suggestion',
	prompt: 'Use theme-aware Big Sky suggestion.',
};

const siteEditorSuggestion = {
	id: 'customize-colors',
	label: 'Customize colors',
	prompt: 'Show me color palettes for my site that are:',
};

const jetpackSuggestion = {
	id: 'proofread-content',
	label: 'Proofread',
	prompt: 'Proofread this saved content.',
};

const UNSUPPORTED_POST_LEVEL_SUGGESTION_TYPES: Array<
	[ label: string, postType: string | undefined ]
> = [
	[ 'templates', 'wp_template' ],
	[ 'template parts', 'wp_template_part' ],
	[ 'patterns', 'wp_block' ],
	[ 'navigation', 'wp_navigation' ],
	[ 'global styles', 'wp_global_styles' ],
	[ 'Site Editor dashboard/list views', undefined ],
	[ 'Jetpack Forms', 'jetpack_form' ],
	[ 'Jetpack Search overlays', 'jp_search_overlay' ],
	[ 'other custom post types', 'custom_post_type' ],
];

function mockCoreStoreReady( isReady: boolean ) {
	mockUseSelect.mockImplementation( ( mapSelect ) =>
		mapSelect( ( storeName: string ) => {
			if ( storeName === 'core/editor' ) {
				return {
					getCurrentPostType: () => mockCurrentPostType,
				};
			}

			return {
				getCurrentTheme: () => ( isReady ? { stylesheet: 'pub/theme' } : null ),
			};
		} )
	);
}

function setReaderSuggestions( readerSuggestions: unknown ) {
	( window as unknown as { agentsManagerData?: Record< string, unknown > } ).agentsManagerData = {
		agentId: 'reader-chat',
		readerSuggestions,
	};
}

describe( 'useEmptyViewSuggestions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.history.pushState( {}, '', '/' );
		mockContext = {
			sectionName: 'gutenberg',
			currentRoute: undefined,
		};
		mockCurrentPostType = undefined;
		mockCoreStoreReady( true );
	} );

	afterEach( () => {
		delete ( window as unknown as { agentsManagerData?: unknown } ).agentsManagerData;
		window.history.pushState( {}, '', '/' );
	} );

	it( 'uses Reader Chat overrides before waiting for the core store', async () => {
		mockCoreStoreReady( false );
		setReaderSuggestions( [ readerSuggestion ] );
		const getEmptyViewSuggestions = jest.fn( () => [ bigSkySuggestion ] );
		const loadedProviders = { getEmptyViewSuggestions } as unknown as LoadedProviders;

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () => expect( result.current ).toEqual( [ readerSuggestion ] ) );
		expect( getEmptyViewSuggestions ).not.toHaveBeenCalled();
	} );

	it( 'keeps an empty Reader Chat override as an explicit no-suggestions state', async () => {
		mockCoreStoreReady( false );
		setReaderSuggestions( [] );
		const getEmptyViewSuggestions = jest.fn( () => [ bigSkySuggestion ] );
		const loadedProviders = { getEmptyViewSuggestions } as unknown as LoadedProviders;

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () => expect( result.current ).toEqual( [] ) );
		expect( getEmptyViewSuggestions ).not.toHaveBeenCalled();
	} );

	it( 'filters malformed Reader Chat override items', async () => {
		mockCoreStoreReady( false );
		setReaderSuggestions( [
			{ id: 'bad-label', label: 123, prompt: 'Prompt must not be enough.' },
			{ id: 'bad-prompt', label: 'Label must not be enough.', prompt: null },
			readerSuggestion,
		] );
		const getEmptyViewSuggestions = jest.fn( () => [ bigSkySuggestion ] );
		const loadedProviders = { getEmptyViewSuggestions } as unknown as LoadedProviders;

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () => expect( result.current ).toEqual( [ readerSuggestion ] ) );
		expect( getEmptyViewSuggestions ).not.toHaveBeenCalled();
	} );

	it( 'filters site-editor-only provider suggestions outside Site Editor', async () => {
		const getEmptyViewSuggestions = jest.fn( () => [ siteEditorSuggestion, bigSkySuggestion ] );
		const loadedProviders = { getEmptyViewSuggestions } as unknown as LoadedProviders;

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () => expect( result.current ).toEqual( [ bigSkySuggestion ] ) );
	} );

	it( 'returns no provider suggestions when all suggestions are site-editor-only outside Site Editor', async () => {
		const getEmptyViewSuggestions = jest.fn( () => [ siteEditorSuggestion ] );
		const loadedProviders = { getEmptyViewSuggestions } as unknown as LoadedProviders;

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () => expect( result.current ).toEqual( [] ) );
	} );

	it( 'filters site-editor-only provider suggestions in the post editor even if section is misreported', async () => {
		mockCurrentPostType = 'post';
		mockContext = {
			sectionName: 'site-editor',
			currentRoute: '/wp-admin/post.php?post=1&action=edit',
		};
		const getEmptyViewSuggestions = jest.fn( () => [ siteEditorSuggestion ] );
		const loadedProviders = { getEmptyViewSuggestions } as unknown as LoadedProviders;

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () => expect( result.current ).toEqual( [] ) );
	} );

	it( 'suppresses default suggestions when provider opts in and exposes no getEmptyViewSuggestions', async () => {
		const loadedProviders = { suppressEmptyViewDefaults: true } as unknown as LoadedProviders;

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () => expect( result.current ).toEqual( [] ) );
	} );

	it( 'suppresses default suggestions when provider opts in and getEmptyViewSuggestions returns empty', async () => {
		const getEmptyViewSuggestions = jest.fn( () => [] );
		const loadedProviders = {
			getEmptyViewSuggestions,
			suppressEmptyViewDefaults: true,
		} as unknown as LoadedProviders;

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () => expect( result.current ).toEqual( [] ) );
	} );

	it( 'keeps site-editor-only provider suggestions in the page editor', async () => {
		mockCurrentPostType = 'page';
		mockContext = {
			sectionName: 'gutenberg',
			currentRoute: '/wp-admin/post.php?post=1&action=edit',
		};
		const getEmptyViewSuggestions = jest.fn( () => [ siteEditorSuggestion, bigSkySuggestion ] );
		const loadedProviders = { getEmptyViewSuggestions } as unknown as LoadedProviders;

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () =>
			expect( result.current ).toEqual( [ siteEditorSuggestion, bigSkySuggestion ] )
		);
	} );

	it( 'filters site-editor-only provider suggestions for non-page post types', async () => {
		mockCurrentPostType = 'product';
		mockContext = {
			sectionName: 'gutenberg',
			currentRoute: '/wp-admin/post.php?post=1&action=edit',
		};
		const getEmptyViewSuggestions = jest.fn( () => [ siteEditorSuggestion, bigSkySuggestion ] );
		const loadedProviders = { getEmptyViewSuggestions } as unknown as LoadedProviders;

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () => expect( result.current ).toEqual( [ bigSkySuggestion ] ) );
	} );

	it( 'updates site-editor-only provider suggestions when the page editor post type resolves', async () => {
		mockContext = {
			sectionName: 'gutenberg',
			currentRoute: '/wp-admin/post.php?post=1&action=edit',
		};
		const getEmptyViewSuggestions = jest.fn( () => [ siteEditorSuggestion, bigSkySuggestion ] );
		const loadedProviders = { getEmptyViewSuggestions } as unknown as LoadedProviders;

		const { result, rerender } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () => expect( result.current ).toEqual( [ bigSkySuggestion ] ) );

		mockCurrentPostType = 'page';
		rerender();

		await waitFor( () =>
			expect( result.current ).toEqual( [ siteEditorSuggestion, bigSkySuggestion ] )
		);
	} );

	it( 'keeps site-editor-only provider suggestions in Site Editor', async () => {
		mockContext = {
			sectionName: 'site-editor',
			currentRoute: undefined,
		};
		const getEmptyViewSuggestions = jest.fn( () => [ siteEditorSuggestion, bigSkySuggestion ] );
		const loadedProviders = { getEmptyViewSuggestions } as unknown as LoadedProviders;

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () =>
			expect( result.current ).toEqual( [ siteEditorSuggestion, bigSkySuggestion ] )
		);
	} );

	it( 'keeps site-editor-only suggestions in the Site Editor when the section is reported as gutenberg', async () => {
		window.history.pushState( {}, '', '/wp-admin/site-editor.php' );
		mockContext = {
			sectionName: 'gutenberg',
			currentRoute: undefined,
		};
		const getEmptyViewSuggestions = jest.fn( () => [ siteEditorSuggestion, bigSkySuggestion ] );
		const loadedProviders = { getEmptyViewSuggestions } as unknown as LoadedProviders;

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () =>
			expect( result.current ).toEqual( [ siteEditorSuggestion, bigSkySuggestion ] )
		);
	} );

	it.each( [ 'wp_template', 'wp_template_part' ] )(
		'keeps site-editor-only provider suggestions for the %s post type',
		async ( postType ) => {
			mockCurrentPostType = postType;
			mockContext = {
				sectionName: 'site-editor',
				currentRoute: `/wp-admin/site-editor.php?postType=${ postType }`,
			};
			const getEmptyViewSuggestions = jest.fn( () => [ siteEditorSuggestion, bigSkySuggestion ] );
			const loadedProviders = { getEmptyViewSuggestions } as unknown as LoadedProviders;

			const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

			await waitFor( () =>
				expect( result.current ).toEqual( [ siteEditorSuggestion, bigSkySuggestion ] )
			);
		}
	);

	it.each( UNSUPPORTED_POST_LEVEL_SUGGESTION_TYPES )(
		'refreshes provider suggestions when navigating from a page to %s and back',
		async ( _label, postType ) => {
			window.history.pushState( {}, '', '/wp-admin/site-editor.php' );
			mockContext = {
				sectionName: 'site-editor',
				currentRoute: '/wp-admin/site-editor.php',
			};
			mockCurrentPostType = 'page';
			const getEmptyViewSuggestions = jest.fn( () => [
				siteEditorSuggestion,
				...( mockCurrentPostType === 'page' ? [ jetpackSuggestion ] : [] ),
			] );
			const loadedProviders = { getEmptyViewSuggestions } as unknown as LoadedProviders;
			const { result, rerender } = renderHook( () =>
				useEmptyViewSuggestions( { loadedProviders } )
			);

			await waitFor( () =>
				expect( result.current ).toEqual( [ siteEditorSuggestion, jetpackSuggestion ] )
			);

			mockCurrentPostType = postType;
			rerender();
			await waitFor( () => expect( result.current ).toEqual( [ siteEditorSuggestion ] ) );

			mockCurrentPostType = 'page';
			rerender();
			await waitFor( () =>
				expect( result.current ).toEqual( [ siteEditorSuggestion, jetpackSuggestion ] )
			);
		}
	);
} );
