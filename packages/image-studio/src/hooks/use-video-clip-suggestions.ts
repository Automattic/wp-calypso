import { type Suggestion } from '@automattic/agenttic-client';
import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { ImageStudioMode } from '../types';
import { formatSuggestionIds } from '../utils/agenttic-tracking';
import {
	trackImageStudioSuggestionClick,
	trackImageStudioSuggestionsRendered,
} from '../utils/tracking';
import { useAsyncSuggestionsLoader } from './use-async-suggestions-loader';
import type { AgentMessage } from '../types/agenttic';

/**
 * System prompt for the video-clip suggestion fetcher.
 *
 * Curates suggestions from post content, but pushes the model toward
 * cinematography vocabulary (camera move, mood, lighting, energy) rather
 * than literal subject descriptions. Veo responds well to short directional
 * phrases — a generic "make it cinematic" prompt produces noisy renders.
 *
 * Hard constraints below mirror the server-side Video_Prompt::STYLE_TEMPLATES:
 * unpopulated, no signage, no on-screen text, no dialogue. Keeping the
 * suggestions inside those rails means the user's clicked prompt won't be
 * rejected by the safety/style guardrails downstream.
 */
const VIDEO_CLIP_SUGGESTIONS_PROMPT = `
Analyze the post content in [[client.gutenberg_page.simple_structure]] and propose
3 short directional prompts for an 8-second 9:16 vertical video clip that would
complement the post.

Each prompt MUST be:
- Grounded in the post's subject matter (a place, object, environment, mood, or
  texture mentioned in the post — not the post's literal headline).
- Phrased as a single piece of visual direction: choose ONE of camera move
  (slow drift, gentle pan, dolly-in, crane, held wide), framing (wide, low-angle,
  establishing), or aesthetic register (golden hour, naturalistic light,
  contemplative, motion-rich, energetic).
- 8-14 words, no trailing punctuation.
- Free of people, faces, hands, crowds, signage, on-screen text, dialogue,
  or copyrighted properties.

Return JSON: { "suggestions": [{ "label": "...", "prompt": "..." }, ...] }
where label is a 2-4 word UI chip and prompt is the full directional sentence.
`.trim();

interface UseVideoClipSuggestionsParams {
	registerSuggestions?: ( suggestions: Suggestion[] ) => void;
	clearSuggestions?: () => void;
	messages?: AgentMessage[];
	disabled?: boolean;
}

interface UseVideoClipSuggestionsReturn {
	handleSuggestionClick: (
		selectedSuggestion: Suggestion,
		availableSuggestions: Suggestion[]
	) => void;
	isLoadingSuggestions: boolean;
	abortSuggestionsLoading: () => void;
}

/**
 * Suggestions hook for the Generate Feature Clip flow.
 *
 * Always fetches asynchronously from the post content (Feature Clip is a
 * post-editor surface — block editor context is guaranteed). Returns the
 * agent-derived chips after the user's first message clears them, and stays
 * inert when disabled. No static fallback: if the fetch fails the chip row
 * is simply empty rather than offering generic suggestions that bear no
 * relation to the post.
 */
export function useVideoClipSuggestions( {
	registerSuggestions,
	clearSuggestions,
	messages,
	disabled = false,
}: UseVideoClipSuggestionsParams ): UseVideoClipSuggestionsReturn {
	const lastTrackedSuggestionsRef = useRef< string >( '' );

	const postId = useSelect( ( storeSelect ) => {
		try {
			return storeSelect( editorStore )?.getCurrentPostId?.() ?? null;
		} catch {
			return null;
		}
	}, [] );

	const cacheKey = postId ? `video-clip-post-${ postId }` : null;
	const hasMessages = Boolean( messages?.length );

	const {
		suggestions: asyncSuggestions,
		abortLoading: abortSuggestionsLoading,
		isLoading: isLoadingSuggestions,
	} = useAsyncSuggestionsLoader( {
		prompt: VIDEO_CLIP_SUGGESTIONS_PROMPT,
		cacheKey,
		enabled: ! disabled,
	} );

	// Effect: register suggestions / clear after first user message.
	// Mirrors the image hook's behavior — clearing after the user has
	// engaged keeps the modal from showing stale chips alongside the
	// agent's reply.
	useEffect( () => {
		if ( disabled ) {
			return;
		}
		if ( hasMessages ) {
			clearSuggestions?.();
			return;
		}
		if ( asyncSuggestions.length === 0 ) {
			return;
		}
		const suggestionIds = formatSuggestionIds( asyncSuggestions );
		if ( suggestionIds === lastTrackedSuggestionsRef.current ) {
			return;
		}
		lastTrackedSuggestionsRef.current = suggestionIds;
		registerSuggestions?.( asyncSuggestions );
		trackImageStudioSuggestionsRendered( {
			suggestions: suggestionIds,
			mode: ImageStudioMode.Generate,
			suggestionType: 'default',
		} );
	}, [ disabled, hasMessages, asyncSuggestions, registerSuggestions, clearSuggestions ] );

	const handleSuggestionClick = useCallback(
		( selectedSuggestion: Suggestion, availableSuggestions: Suggestion[] ) => {
			trackImageStudioSuggestionClick( {
				suggestionId: selectedSuggestion.id || '',
				suggestionText: selectedSuggestion.prompt || '',
				availableSuggestions: formatSuggestionIds( availableSuggestions ),
				mode: ImageStudioMode.Generate,
			} );
		},
		[]
	);

	if ( disabled ) {
		return {
			handleSuggestionClick: () => {},
			isLoadingSuggestions: false,
			abortSuggestionsLoading: () => {},
		};
	}

	return {
		handleSuggestionClick,
		isLoadingSuggestions,
		abortSuggestionsLoading,
	};
}
