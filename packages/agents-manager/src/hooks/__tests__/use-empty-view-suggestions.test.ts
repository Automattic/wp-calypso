/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
const mockUseSelect = jest.fn();
let mockContext = {
	sectionName: 'gutenberg',
	currentRoute: undefined as string | undefined,
};

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

function mockCoreStoreReady( isReady: boolean ) {
	mockUseSelect.mockImplementation( ( mapSelect ) =>
		mapSelect( () => ( {
			getCurrentTheme: () => ( isReady ? { stylesheet: 'pub/theme' } : null ),
		} ) )
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
		mockContext = {
			sectionName: 'site-editor',
			currentRoute: '/wp-admin/post.php?post=1&action=edit',
		};
		const getEmptyViewSuggestions = jest.fn( () => [ siteEditorSuggestion ] );
		const loadedProviders = { getEmptyViewSuggestions } as unknown as LoadedProviders;

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () => expect( result.current ).toEqual( [] ) );
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
} );
