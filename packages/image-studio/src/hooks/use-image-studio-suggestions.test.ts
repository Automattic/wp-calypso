import { renderHook } from '@testing-library/react';
import { ImageStudioMode } from '../types';
import { useImageStudioSuggestions } from './use-image-studio-suggestions';

interface UseImageStudioSuggestionsParams {
	registerSuggestions?: ( suggestions: any[] ) => void;
	clearSuggestions?: () => void;
	messages?: any[];
	mode?: ImageStudioMode;
	inputValue?: string;
}

let mockSelectorState: {
	hasAnnotations: boolean;
	isAiProcessing: boolean;
	isAnnotationSaving: boolean;
	isCurrentAttachmentAnnotated: boolean;
	isAnnotationMode: boolean;
};

let mockCurrentScreenState: {
	isPostEditor: boolean;
	isSiteEditor: boolean;
};

// Mock for useAsyncSuggestionsLoader
let mockAsyncSuggestions: any[] = [];
const mockAbortLoading = jest.fn();
let mockIsLoadingSuggestions = false;

const mockSetAnnotationMode = jest.fn();
const mockRegisterSuggestions = jest.fn();
const mockClearSuggestions = jest.fn();
jest.mock( '@wordpress/data', () => {
	const getMockSetAnnotationMode = () => mockSetAnnotationMode;
	return {
		select: jest.fn( () => ( {
			getCurrentPostId: () => '123',
		} ) ),
		useDispatch: jest.fn( () => ( {
			setAnnotationMode: getMockSetAnnotationMode(),
		} ) ),
		useSelect: jest.fn( ( callback ) =>
			callback( () => ( {
				getAnnotationCanvasRef: () => ( {
					hasAnnotations: () => mockSelectorState.hasAnnotations,
					clear: jest.fn(),
				} ),
				getImageStudioAiProcessing: () => mockSelectorState.isAiProcessing,
				getIsAnnotationSaving: () => mockSelectorState.isAnnotationSaving,
				getIsAnnotationMode: () => mockSelectorState.isAnnotationMode,
				getImageStudioAttachmentId: () => 123,
				getAnnotatedAttachmentIds: () =>
					mockSelectorState.isCurrentAttachmentAnnotated ? [ 123 ] : [],
			} ) )
		),
	};
} );

jest.mock( '@wordpress/editor', () => ( {
	store: 'core/editor',
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: jest.fn( ( str ) => str ),
} ) );

jest.mock( '../store', () => ( {
	store: 'image-studio',
} ) );

jest.mock( './use-current-screen', () => ( {
	__esModule: true,
	default: () => mockCurrentScreenState,
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioSuggestionsRendered: jest.fn(),
	trackImageStudioSuggestionClick: jest.fn(),
} ) );

jest.mock( '../utils/agenttic-tracking', () => ( {
	formatSuggestionIds: jest.fn(),
} ) );

const trackingMocks = jest.requireMock( '../utils/tracking' ) as jest.Mocked<
	typeof import('../utils/tracking')
>;
const {
	trackImageStudioSuggestionsRendered: mockTrackImageStudioSuggestionsRendered,
	trackImageStudioSuggestionClick: mockTrackImageStudioSuggestionClick,
} = trackingMocks;

const { formatSuggestionIds: mockFormatSuggestionIds } = jest.requireMock(
	'../utils/agenttic-tracking'
) as jest.Mocked< typeof import('../utils/agenttic-tracking') >;

mockFormatSuggestionIds.mockImplementation(
	( suggestions: any[] ) =>
		'|' + suggestions.map( ( suggestion ) => suggestion.id ).join( '|' ) + '|'
);

jest.mock( './use-async-suggestions-loader', () => ( {
	useAsyncSuggestionsLoader: () => ( {
		suggestions: mockAsyncSuggestions,
		abortLoading: mockAbortLoading,
		isLoading: mockIsLoadingSuggestions,
	} ),
} ) );

/**
 * Helper to create default hook params with overrides.
 * @param overrides - Partial< UseImageStudioSuggestionsParams > - Overrides for the hook params.
 * @returns The hook params.
 */
function createHookParams(
	overrides: Partial< UseImageStudioSuggestionsParams > = {}
): UseImageStudioSuggestionsParams {
	return {
		registerSuggestions: mockRegisterSuggestions,
		clearSuggestions: mockClearSuggestions,
		messages: [],
		mode: ImageStudioMode.Edit,
		...overrides,
	};
}

describe( 'useImageStudioSuggestions', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		mockSelectorState = {
			hasAnnotations: false,
			isAiProcessing: false,
			isAnnotationSaving: false,
			isCurrentAttachmentAnnotated: false,
			isAnnotationMode: false,
		};

		mockCurrentScreenState = {
			isPostEditor: false,
			isSiteEditor: false,
		};

		mockAsyncSuggestions = [];
		mockIsLoadingSuggestions = false;
	} );

	describe( 'edit mode suggestions', () => {
		it( 'shows annotate suggestion when image is not annotated', () => {
			renderHook( () => useImageStudioSuggestions( createHookParams() ) );

			expect( mockRegisterSuggestions ).toHaveBeenCalled();
			const suggestions = mockRegisterSuggestions.mock.calls[ 0 ][ 0 ];

			expect( suggestions ).toHaveLength( 3 );
			expect( suggestions[ 0 ].id ).toBe( 'annotate-image' );
			expect( suggestions[ 1 ].id ).toBe( 'enhance-image' );
			expect( suggestions[ 2 ].id ).toBe( 'brighten-image' );
		} );

		it( 'shows edit suggestions without annotate option when image is already annotated', () => {
			mockSelectorState.isCurrentAttachmentAnnotated = true;

			renderHook( () => useImageStudioSuggestions( createHookParams() ) );

			expect( mockRegisterSuggestions ).toHaveBeenCalled();
			const suggestions = mockRegisterSuggestions.mock.calls[ 0 ][ 0 ];

			expect( suggestions ).toHaveLength( 2 );
			expect( suggestions[ 0 ].id ).toBe( 'enhance-image' );
			expect( suggestions[ 1 ].id ).toBe( 'brighten-image' );
		} );
	} );

	describe( 'generate mode suggestions', () => {
		it( 'registers default generate suggestions when not in block editor', () => {
			renderHook( () =>
				useImageStudioSuggestions( createHookParams( { mode: ImageStudioMode.Generate } ) )
			);

			expect( mockRegisterSuggestions ).toHaveBeenCalled();
			const suggestions = mockRegisterSuggestions.mock.calls[ 0 ][ 0 ];

			expect( suggestions ).toHaveLength( 3 );
			expect( suggestions[ 0 ].id ).toBe( 'generate-image-a' );
			expect( suggestions[ 1 ].id ).toBe( 'generate-image-b' );
			expect( suggestions[ 2 ].id ).toBe( 'generate-image-c' );
		} );

		it( 'does not register suggestions when async suggestions are empty', () => {
			mockCurrentScreenState.isPostEditor = true;
			mockAsyncSuggestions = [];

			renderHook( () =>
				useImageStudioSuggestions( createHookParams( { mode: ImageStudioMode.Generate } ) )
			);

			// Should not register empty suggestions
			expect( mockRegisterSuggestions ).not.toHaveBeenCalled();
		} );

		it( 'registers async suggestions when available in block editor', () => {
			mockCurrentScreenState.isPostEditor = true;
			mockAsyncSuggestions = [
				{ id: 'async-1', label: 'Async suggestion 1' },
				{ id: 'async-2', label: 'Async suggestion 2' },
			];

			renderHook( () =>
				useImageStudioSuggestions( createHookParams( { mode: ImageStudioMode.Generate } ) )
			);

			expect( mockRegisterSuggestions ).toHaveBeenCalled();

			const suggestions = mockRegisterSuggestions.mock.calls[ 0 ][ 0 ];
			expect( suggestions ).toHaveLength( 2 );
			expect( suggestions[ 0 ].id ).toBe( 'async-1' );
			expect( suggestions[ 1 ].id ).toBe( 'async-2' );
		} );
	} );

	describe( 'annotation suggestions', () => {
		it( 'shows annotation suggestions when annotations are present', () => {
			mockSelectorState.hasAnnotations = true;

			renderHook( () => useImageStudioSuggestions( createHookParams() ) );

			expect( mockRegisterSuggestions ).toHaveBeenCalled();
			const suggestions = mockRegisterSuggestions.mock.calls[ 0 ][ 0 ];

			expect( suggestions ).toHaveLength( 3 );
			expect( suggestions[ 0 ].id ).toBe( 'replace-annotated' );
			expect( suggestions[ 1 ].id ).toBe( 'remove-annotated' );
			expect( suggestions[ 2 ].id ).toBe( 'enhance-annotated' );
		} );

		it( 'tracks annotation suggestions with correct type', () => {
			mockSelectorState.hasAnnotations = true;

			renderHook( () => useImageStudioSuggestions( createHookParams() ) );

			expect( mockTrackImageStudioSuggestionsRendered ).toHaveBeenCalledWith( {
				suggestions: expect.any( String ),
				mode: ImageStudioMode.Edit,
				suggestionType: 'annotation',
			} );
		} );

		it( 'does not show annotation suggestions while AI is processing', () => {
			mockSelectorState.hasAnnotations = true;
			mockSelectorState.isAiProcessing = true;

			renderHook( () => useImageStudioSuggestions( createHookParams() ) );

			expect( mockRegisterSuggestions ).toHaveBeenCalledWith( [] );
		} );

		it( 'does not show annotation suggestions while saving', () => {
			mockSelectorState.hasAnnotations = true;
			mockSelectorState.isAnnotationSaving = true;

			renderHook( () => useImageStudioSuggestions( createHookParams() ) );

			expect( mockRegisterSuggestions ).toHaveBeenCalledWith( [] );
		} );

		it( 'does not show suggestions in annotation mode', () => {
			mockSelectorState.isAnnotationMode = true;

			renderHook( () => useImageStudioSuggestions( createHookParams() ) );

			expect( mockRegisterSuggestions ).toHaveBeenCalledWith( [] );
		} );
	} );

	describe( 'clearing suggestions', () => {
		it( 'clears suggestions when messages are present', () => {
			renderHook( () =>
				useImageStudioSuggestions(
					createHookParams( {
						messages: [ { role: 'user', content: 'test message' } ],
					} )
				)
			);

			expect( mockClearSuggestions ).toHaveBeenCalled();
		} );
	} );

	describe( 'tracking', () => {
		it( 'tracks default suggestions rendered', () => {
			renderHook( () => useImageStudioSuggestions( createHookParams() ) );

			expect( mockTrackImageStudioSuggestionsRendered ).toHaveBeenCalledWith( {
				suggestions: expect.any( String ),
				mode: ImageStudioMode.Edit,
				suggestionType: 'default',
			} );
		} );

		it( 'does not track again when the same suggestions are registered on re-render', () => {
			const { rerender } = renderHook( () => useImageStudioSuggestions( createHookParams() ) );

			// First render should track
			expect( mockTrackImageStudioSuggestionsRendered ).toHaveBeenCalledTimes( 1 );

			// Re-render with same params - should not track again
			rerender();
			rerender();
			rerender();

			// Tracking should still only have been called once
			expect( mockTrackImageStudioSuggestionsRendered ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'tracks again when suggestions actually change', () => {
			// Start without annotations (edit suggestions)
			mockSelectorState.hasAnnotations = false;

			const { rerender } = renderHook( () => useImageStudioSuggestions( createHookParams() ) );

			// First render tracks edit suggestions
			expect( mockTrackImageStudioSuggestionsRendered ).toHaveBeenCalledTimes( 1 );
			expect( mockTrackImageStudioSuggestionsRendered ).toHaveBeenLastCalledWith( {
				suggestions: expect.stringContaining( 'annotate-image' ),
				mode: ImageStudioMode.Edit,
				suggestionType: 'default',
			} );

			// Change to annotation suggestions
			mockSelectorState.hasAnnotations = true;
			rerender();

			// Should track again with different suggestions
			expect( mockTrackImageStudioSuggestionsRendered ).toHaveBeenCalledTimes( 2 );
			expect( mockTrackImageStudioSuggestionsRendered ).toHaveBeenLastCalledWith( {
				suggestions: expect.stringContaining( 'replace-annotated' ),
				mode: ImageStudioMode.Edit,
				suggestionType: 'annotation',
			} );
		} );

		it( 'handleSuggestionClick tracks the click', () => {
			const { result } = renderHook( () => useImageStudioSuggestions( createHookParams() ) );

			const selectedSuggestion = {
				id: 'enhance-image',
				label: 'Enhance image',
				prompt: 'Enhance this image',
			};
			const availableSuggestions = [
				{ id: 'enhance-image', label: 'Enhance image' },
				{ id: 'brighten-image', label: 'Brighten image' },
			];

			result.current.handleSuggestionClick( selectedSuggestion, availableSuggestions );

			expect( mockTrackImageStudioSuggestionClick ).toHaveBeenCalledWith( {
				suggestionId: 'enhance-image',
				suggestionText: 'Enhance this image',
				availableSuggestions: '|enhance-image|brighten-image|',
				mode: ImageStudioMode.Edit,
			} );
		} );
	} );

	describe( 'return values', () => {
		it( 'returns isLoadingSuggestions and abortSuggestionsLoading', () => {
			const { result } = renderHook( () => useImageStudioSuggestions( createHookParams() ) );

			expect( result.current ).toHaveProperty( 'isLoadingSuggestions' );
			expect( result.current ).toHaveProperty( 'abortSuggestionsLoading' );
			expect( typeof result.current.abortSuggestionsLoading ).toBe( 'function' );
		} );
	} );
} );
