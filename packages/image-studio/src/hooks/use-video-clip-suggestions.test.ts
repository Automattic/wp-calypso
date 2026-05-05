/**
 * @jest-environment jsdom
 */

( globalThis as Record< string, unknown > ).__i18n_text_domain__ = 'default';

const mockUseAsyncSuggestionsLoader = jest.fn();
const mockTrackImageStudioSuggestionsRendered = jest.fn();
const mockTrackImageStudioSuggestionClick = jest.fn();
const mockGetCurrentPostId = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( selector: ( fn: unknown ) => unknown ) =>
		selector( () => ( { getCurrentPostId: mockGetCurrentPostId } ) ),
} ) );

jest.mock( '@wordpress/editor', () => ( {
	store: 'core/editor',
} ) );

jest.mock( './use-async-suggestions-loader', () => ( {
	useAsyncSuggestionsLoader: ( opts: unknown ) => mockUseAsyncSuggestionsLoader( opts ),
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioSuggestionsRendered: ( ...args: unknown[] ) =>
		mockTrackImageStudioSuggestionsRendered( ...args ),
	trackImageStudioSuggestionClick: ( ...args: unknown[] ) =>
		mockTrackImageStudioSuggestionClick( ...args ),
} ) );

jest.mock( '../utils/agenttic-tracking', () => ( {
	formatSuggestionIds: ( suggestions: Array< { id?: string } > ) =>
		suggestions.map( ( s ) => s.id ?? '' ).join( '|' ),
} ) );

jest.mock( '../types', () => ( {
	ImageStudioMode: { Generate: 'generate', Edit: 'edit' },
} ) );

// eslint-disable-next-line import/order
import { renderHook } from '@testing-library/react';
// eslint-disable-next-line import/order
import { useVideoClipSuggestions } from './use-video-clip-suggestions';

const noopAbort = () => {};

beforeEach( () => {
	mockUseAsyncSuggestionsLoader.mockReset();
	mockTrackImageStudioSuggestionsRendered.mockClear();
	mockTrackImageStudioSuggestionClick.mockClear();
	mockGetCurrentPostId.mockReset();
	mockGetCurrentPostId.mockReturnValue( 42 );
	mockUseAsyncSuggestionsLoader.mockReturnValue( {
		suggestions: [],
		isLoading: false,
		abortLoading: noopAbort,
	} );
} );

describe( 'useVideoClipSuggestions', () => {
	it( 'enables the loader and namespaces the cache key by post id', () => {
		renderHook( () =>
			useVideoClipSuggestions( {
				registerSuggestions: jest.fn(),
				clearSuggestions: jest.fn(),
				messages: [],
			} )
		);

		expect( mockUseAsyncSuggestionsLoader ).toHaveBeenCalledWith(
			expect.objectContaining( {
				cacheKey: 'video-clip-post-42',
				enabled: true,
			} )
		);
	} );

	it( 'disables the loader and returns no-op handlers when disabled', () => {
		const registerSuggestions = jest.fn();
		const { result } = renderHook( () =>
			useVideoClipSuggestions( {
				registerSuggestions,
				clearSuggestions: jest.fn(),
				messages: [],
				disabled: true,
			} )
		);

		expect( mockUseAsyncSuggestionsLoader ).toHaveBeenCalledWith(
			expect.objectContaining( { enabled: false } )
		);
		expect( registerSuggestions ).not.toHaveBeenCalled();
		expect( result.current.isLoadingSuggestions ).toBe( false );
		expect( typeof result.current.abortSuggestionsLoading ).toBe( 'function' );
		expect( typeof result.current.handleSuggestionClick ).toBe( 'function' );
	} );

	it( 'registers async suggestions and fires the rendered tracking event', () => {
		const registerSuggestions = jest.fn();
		mockUseAsyncSuggestionsLoader.mockReturnValue( {
			suggestions: [
				{ id: 'a', label: 'Drift', prompt: 'Slow drift across the scene' },
				{ id: 'b', label: 'Crane', prompt: 'Energetic crane reveal' },
			],
			isLoading: false,
			abortLoading: noopAbort,
		} );

		renderHook( () =>
			useVideoClipSuggestions( {
				registerSuggestions,
				clearSuggestions: jest.fn(),
				messages: [],
			} )
		);

		expect( registerSuggestions ).toHaveBeenCalledWith( [
			{ id: 'a', label: 'Drift', prompt: 'Slow drift across the scene' },
			{ id: 'b', label: 'Crane', prompt: 'Energetic crane reveal' },
		] );
		expect( mockTrackImageStudioSuggestionsRendered ).toHaveBeenCalledWith( {
			suggestions: 'a|b',
			mode: 'generate',
			suggestionType: 'default',
		} );
	} );

	it( 'clears suggestions once the user has sent a message', () => {
		const clearSuggestions = jest.fn();
		const registerSuggestions = jest.fn();
		mockUseAsyncSuggestionsLoader.mockReturnValue( {
			suggestions: [ { id: 'a', label: 'Drift', prompt: 'Slow drift' } ],
			isLoading: false,
			abortLoading: noopAbort,
		} );

		renderHook( () =>
			useVideoClipSuggestions( {
				registerSuggestions,
				clearSuggestions,
				messages: [ { id: 'msg-1', role: 'user' } ],
			} )
		);

		expect( clearSuggestions ).toHaveBeenCalledTimes( 1 );
		expect( registerSuggestions ).not.toHaveBeenCalled();
	} );

	it( 'tracks click events with the right placement-friendly mode', () => {
		mockUseAsyncSuggestionsLoader.mockReturnValue( {
			suggestions: [ { id: 'a', label: 'Drift', prompt: 'Slow drift across the scene' } ],
			isLoading: false,
			abortLoading: noopAbort,
		} );

		const { result } = renderHook( () =>
			useVideoClipSuggestions( {
				registerSuggestions: jest.fn(),
				clearSuggestions: jest.fn(),
				messages: [],
			} )
		);

		const suggestion = { id: 'a', label: 'Drift', prompt: 'Slow drift across the scene' };
		result.current.handleSuggestionClick( suggestion, [ suggestion ] );

		expect( mockTrackImageStudioSuggestionClick ).toHaveBeenCalledWith( {
			suggestionId: 'a',
			suggestionText: 'Slow drift across the scene',
			availableSuggestions: 'a',
			mode: 'generate',
		} );
	} );

	it( 'leaves cache key null when no post id is available (e.g. site editor)', () => {
		mockGetCurrentPostId.mockReturnValue( null );

		renderHook( () =>
			useVideoClipSuggestions( {
				registerSuggestions: jest.fn(),
				clearSuggestions: jest.fn(),
				messages: [],
			} )
		);

		expect( mockUseAsyncSuggestionsLoader ).toHaveBeenCalledWith(
			expect.objectContaining( { cacheKey: null } )
		);
	} );
} );
