import { type Suggestion } from '@automattic/agenttic-client';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { ImageStudioMode } from '../types';
import { formatSuggestionIds } from '../utils/agenttic-tracking';
import {
	trackImageStudioSuggestionClick,
	trackImageStudioSuggestionsRendered,
} from '../utils/tracking';
import { getSuggestions, type SuggestionState } from './suggestions-data';
import { useAsyncSuggestionsLoader } from './use-async-suggestions-loader';
import useCurrentScreen from './use-current-screen';
import type { AgentMessage } from '../types/agenttic';
import type { CurriedImageStudioSelectors } from '../types/wordpress';

/**
 * Async suggestions configuration for different contexts.
 */
interface AsyncSuggestionsConfig {
	prompt: string;
	cacheKey: string | null;
}

/**
 * Get async suggestions config based on editor context.
 * Returns null if no async loading is needed for this context.
 * @param isBlockEditor - Whether we're in a block editor context.
 * @param postId        - The current post ID (if available).
 * @param entryPoint    - How the Image Studio modal was opened.
 */
function getAsyncSuggestionsConfig(
	isBlockEditor: boolean,
	postId: string | number | null,
	entryPoint: ImageStudioEntryPoint | null
): AsyncSuggestionsConfig | null {
	// Feature-clip flow: tone & style live in the dropdowns, so chips must be
	// pure CONTENT distilled from the post body — no cinematography or tone
	// language baked in.
	if ( entryPoint === ImageStudioEntryPoint.PostEditorFeatureClip ) {
		return {
			prompt:
				'You will receive a WordPress post via the page context [[client.gutenberg_page.simple_structure]]. Distill that post content into 3 short, evocative video-clip prompts a user could click to start a generation. Each prompt MUST: be a single sentence, be 120 characters or fewer, name a concrete visual subject from the post, add one sensory detail, and hint at motion. Each prompt MUST NOT: include cinematography terms (cinematic, documentary, aerial, macro, drone, slow-motion, time-lapse, etc.), tone words (informative, promotional, educational, salesy, etc.), camera/lens jargon, or on-screen text. Style and tone are already chosen elsewhere — chips are content only.',
			cacheKey: postId ? `feature-clip-post-${ postId }` : null,
		};
	}

	if ( isBlockEditor ) {
		return {
			prompt:
				'Analyze the post content in context [[client.gutenberg_page.simple_structure]] and generate 3 image prompt suggestions that would complement the content.',
			cacheKey: postId ? `post-${ postId }` : null,
		};
	}

	return null;
}

/**
 * Retrieves suggestion-related state from the image studio store.
 * @param selectors - The store selectors.
 * @returns The current suggestion state.
 */
function getSuggestionState( selectors: CurriedImageStudioSelectors ): SuggestionState {
	const annotationCanvasRef = selectors.getAnnotationCanvasRef();
	const currentAttachmentId = selectors.getImageStudioAttachmentId();
	const annotatedAttachmentIds = selectors.getAnnotatedAttachmentIds() || [];

	return {
		hasAnnotations: annotationCanvasRef?.hasAnnotations?.() ?? false,
		isAiProcessing: selectors.getImageStudioAiProcessing(),
		isAnnotationSaving: selectors.getIsAnnotationSaving(),
		isAnnotationMode: selectors.getIsAnnotationMode(),
		isCurrentAttachmentAnnotated: Boolean(
			currentAttachmentId && annotatedAttachmentIds.includes( currentAttachmentId )
		),
	};
}

interface UseImageStudioSuggestionsParams {
	registerSuggestions?: ( suggestions: Suggestion[] ) => void;
	clearSuggestions?: () => void;
	messages?: AgentMessage[];
	mode?: ImageStudioMode;
	// Current input value (for detecting when input is cleared to refresh suggestions).
	inputValue?: string;
}

interface UseImageStudioSuggestionsReturn {
	handleSuggestionClick: (
		selectedSuggestion: Suggestion,
		availableSuggestions: Suggestion[]
	) => void;
	isLoadingSuggestions: boolean;
	abortSuggestionsLoading: () => void;
}

/**
 * Hook that manages image editing suggestions for the Image Studio.
 *
 * Registers contextual suggestions based on the current mode (edit/generate),
 * annotation state, and editor context. Automatically clears suggestions
 * after the user sends their first message.
 *
 * In generate mode within the block editor, fetches AI-generated suggestions
 * based on the post content (with caching).
 * @param params                     - Hook parameters.
 * @param params.registerSuggestions - Function to register suggestions with the agent.
 * @param params.clearSuggestions    - Function to clear all suggestions.
 * @param params.messages            - Array of chat messages.
 * @param params.mode                - Current image studio mode (edit or generate).
 * @param params.inputValue          - Current input value (triggers refresh when cleared).
 * @returns Object containing handlers and loading state.
 */
export function useImageStudioSuggestions( {
	registerSuggestions,
	clearSuggestions,
	messages,
	mode,
	inputValue,
}: UseImageStudioSuggestionsParams ): UseImageStudioSuggestionsReturn {
	// Track previous input value for detecting when input is cleared
	const prevInputValueRef = useRef< string | undefined >( undefined );
	// Track last rendered suggestions to avoid duplicate tracking events
	const lastTrackedSuggestionsRef = useRef< string >( '' );
	const [ refreshTrigger, setRefreshTrigger ] = useState( 0 );

	/**
	 * Effect: Detect when input is cleared and trigger suggestions refresh.
	 */
	useEffect( () => {
		const wasCleared =
			prevInputValueRef.current !== undefined &&
			prevInputValueRef.current.length > 0 &&
			inputValue === '';
		prevInputValueRef.current = inputValue;

		if ( wasCleared ) {
			setRefreshTrigger( ( t ) => t + 1 );
		}
	}, [ inputValue ] );

	// Get current state from the image studio store and editor store
	const { suggestionState, postId, entryPoint } = useSelect( ( storeSelect ) => {
		let currentPostId: string | number | null = null;
		try {
			currentPostId = storeSelect( editorStore )?.getCurrentPostId?.() ?? null;
		} catch {
			// eslint-disable-next-line no-console
			console.debug( '[Image Studio] Failed to get current post ID from editor store.' );
		}
		// Multi-bundle defense: an older store registration may not export
		// getEntryPoint. Fall back to null and the existing image branch.
		const imageStudioSelectors = storeSelect( imageStudioStore ) as unknown as {
			getEntryPoint?: () => ImageStudioEntryPoint | null;
		};
		return {
			suggestionState: getSuggestionState( storeSelect( imageStudioStore ) ),
			postId: currentPostId,
			entryPoint: imageStudioSelectors.getEntryPoint?.() ?? null,
		};
	}, [] );

	const { setAnnotationMode } = useDispatch( imageStudioStore );

	// Determine editor context
	const { isPostEditor, isSiteEditor } = useCurrentScreen();
	const isBlockEditor = isPostEditor || isSiteEditor;

	// Get async suggestions config for current context
	const asyncConfig = getAsyncSuggestionsConfig( isBlockEditor, postId, entryPoint );
	const supportsAsyncSuggestions = asyncConfig !== null;

	// Async suggestions loader - loads when in generate mode within block editor
	const {
		suggestions: asyncSuggestions,
		abortLoading: abortSuggestionsLoading,
		isLoading: isLoadingSuggestions,
	} = useAsyncSuggestionsLoader( {
		prompt: asyncConfig?.prompt ?? '',
		cacheKey: asyncConfig?.cacheKey,
		enabled: supportsAsyncSuggestions && mode === ImageStudioMode.Generate,
	} );

	/**
	 * Registers suggestions and tracks the render event (only if suggestions changed).
	 */
	const registerSuggestionsAndTrack = useCallback(
		( suggestions: Suggestion[], suggestionType: 'default' | 'annotation' = 'default' ) => {
			registerSuggestions?.( suggestions );

			// Only track if suggestions have actually changed
			const suggestionIds = formatSuggestionIds( suggestions );

			if ( suggestionIds !== lastTrackedSuggestionsRef.current ) {
				lastTrackedSuggestionsRef.current = suggestionIds;
				trackImageStudioSuggestionsRendered( {
					suggestions: suggestionIds,
					mode: mode || ImageStudioMode.Edit,
					suggestionType,
				} );
			}
		},
		[ registerSuggestions, mode ]
	);

	/**
	 * Effect: Register appropriate suggestions based on current context.
	 */
	useEffect( () => {
		const result = getSuggestions( {
			...suggestionState,
			mode,
			hasMessages: Boolean( messages?.length ),
			supportsAsyncSuggestions,
			setAnnotationMode,
		} );

		// Handle clear case separately
		if ( result.type === 'clear' ) {
			clearSuggestions?.();
			return;
		}

		// Handle empty case (during processing or annotation mode)
		if ( result.type === 'empty' ) {
			registerSuggestions?.( [] );
			return;
		}

		// For async generate mode, use the loaded async suggestions
		if ( result.type === 'generate' && supportsAsyncSuggestions ) {
			if ( asyncSuggestions.length > 0 ) {
				registerSuggestionsAndTrack( asyncSuggestions );
			}
			return;
		}

		// Register suggestions with tracking
		registerSuggestionsAndTrack(
			result.suggestions,
			result.type === 'annotation' ? 'annotation' : 'default'
		);
	}, [
		suggestionState,
		mode,
		messages?.length,
		supportsAsyncSuggestions,
		setAnnotationMode,
		clearSuggestions,
		registerSuggestions,
		registerSuggestionsAndTrack,
		refreshTrigger,
		asyncSuggestions,
	] );

	/**
	 * Tracks when a user clicks on a suggestion.
	 */
	const handleSuggestionClick = useCallback(
		( selectedSuggestion: Suggestion, availableSuggestions: Suggestion[] ) => {
			trackImageStudioSuggestionClick( {
				suggestionId: selectedSuggestion.id || '',
				suggestionText: selectedSuggestion.prompt || '',
				availableSuggestions: formatSuggestionIds( availableSuggestions ),
				mode: mode || ImageStudioMode.Edit,
			} );
		},
		[ mode ]
	);

	return {
		handleSuggestionClick,
		isLoadingSuggestions,
		abortSuggestionsLoading,
	};
}
