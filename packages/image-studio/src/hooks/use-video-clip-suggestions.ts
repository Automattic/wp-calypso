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

const MAX_POST_BODY_CHARS = 2000;
const EMPTY_SUGGESTIONS: Suggestion[] = [];

/**
 * The post body is inlined verbatim because the suggestions endpoint does
 * not run server-side `[[client.gutenberg_page.simple_structure]]`
 * substitution — sending that placeholder leaves the LLM with no context
 * and an active video tool, and it ends up calling the tool instead of
 * returning chips.
 *
 * Each prompt deliberately combines TWO descriptive axes (e.g. camera
 * move + lighting, or texture + time-of-day). Single-axis prompts read
 * thin to Veo and tend to produce generic outputs; pairing two axes
 * gives the model concrete intent in both motion and look.
 */
export function buildVideoClipSuggestionsPrompt( postBody: string ): string {
	const trimmed = postBody.slice( 0, MAX_POST_BODY_CHARS );
	return `Below is the body of a WordPress post. Propose 3 dense directional prompts for an 8-second 9:16 vertical video clip that would complement the post.

Each prompt MUST be:
- Grounded in the post's subject matter (a place, object, environment, mood, or texture mentioned in the post — not the post's literal headline).
- Phrased as a single piece of visual direction that COMBINES TWO of the following axes (never just one):
  - Camera move (slow drift, gentle pan, dolly-in, crane, push-in, held wide, parallax tracking).
  - Subject specificity (a concrete object/place from the post — not a generic noun).
  - Lighting / mood (golden hour, overcast, naturalistic key, contemplative, motion-rich, energetic, twilight ambient).
  - Texture / material detail (worn copper, weathered linen, polished oak, condensation on glass, matte ceramic).
  - Time-of-day (dawn, blue hour, late afternoon, deep dusk).
- 20-40 words, no trailing punctuation.
- People may appear — only adults, no children or minors. Describe them generically (e.g. "a barista", "a hiker") with no named individuals, public figures, or recognizable likenesses.
- Free of crowds, on-screen text, signage, dialogue, or copyrighted properties — these are non-negotiable for the safety pipeline.

POST BODY:
${ trimmed }`;
}

/**
 * Suggestions for the Highlights style. The Highlights flow doesn't use the
 * user prompt to describe what the video should LOOK like — it summarizes the
 * post automatically. The prompt's role is purely steering: angle, audience,
 * voice, structure. So suggestions here are short framing hints, not
 * cinematography.
 */
export function buildHighlightsClipSuggestionsPrompt( postBody: string ): string {
	const trimmed = postBody.slice( 0, MAX_POST_BODY_CHARS );
	return `Below is the body of a WordPress post. Propose 3 short framing hints a user could pick to steer a ~24-second summary video derived from this post.

The video itself is rendered automatically from the post's content — these hints DO NOT describe what the video should look like. They steer how the LLM picks WHICH parts to emphasize. Think of them as editorial direction.

Each hint MUST be:
- Grounded in the post's actual content (an angle that makes sense for THIS post, not generic blog-post advice).
- One of these flavors:
  - **Angle**: lead with a specific aspect ("Lead with the geology", "Focus on the family's first reaction").
  - **Audience**: who's it for ("For travel-curious readers", "For someone who's never visited", "For experienced cooks").
  - **Structure**: how it's organized ("Three things to try at home", "Before-and-after", "What I'd do differently").
  - **Voice**: tone register ("Punchier", "More contemplative", "Drop the hedges").
- 2-8 words for the chip label, 6-15 words for the prompt sentence.
- Concrete and actionable — never "Make it good" or "Be engaging".
- No camera moves, no lighting, no visual description (those don't apply here).

POST BODY:
${ trimmed }`;
}

function buildVideoClipSystemPrompt( suggestionPrompt: string, locale: string ): string {
	return `You generate suggestion chips for a short video clip composer. You DO NOT call any tools. You DO NOT generate, edit, or modify any media. You return only JSON.

${ suggestionPrompt }

Output ONLY valid JSON matching this exact structure (no markdown, no explanation, no tool calls). The "suggestions" array MUST contain exactly 3 items:
{"suggestions":[{"label":"2-4 word chip A","prompt":"20-40 word directional sentence combining two axes"},{"label":"2-4 word chip B","prompt":"20-40 word directional sentence combining two axes"},{"label":"2-4 word chip C","prompt":"20-40 word directional sentence combining two axes"}]}

The chip "label" stays 2-4 words (it's tight UI real estate). The "prompt" is the dense one — 20-40 words, two axes combined.

Generate all text in the language corresponding to locale code "${ locale }" (e.g. en = English, fr = French, es = Spanish).

Output valid JSON only, nothing else.`;
}

interface UseVideoClipSuggestionsParams {
	registerSuggestions?: ( suggestions: Suggestion[] ) => void;
	clearSuggestions?: () => void;
	messages?: AgentMessage[];
	/**
	 * Current chat input value. When this transitions from non-empty to
	 * empty BEFORE any message has been sent, chips re-appear (mirrors the
	 * initial-load condition). Once a message has been sent the chip-row
	 * stays cleared regardless of input value.
	 */
	inputValue?: string;
	disabled?: boolean;
	/**
	 * The currently-selected video style. Determines which prompt variant
	 * the loader uses — Cinematic gets cinematography-flavored chips,
	 * Highlights gets framing/steering chips. Cache key includes the style
	 * so toggling between them reuses prior results without re-fetching.
	 */
	style?: string | null;
}

interface UseVideoClipSuggestionsReturn {
	handleSuggestionClick: (
		selectedSuggestion: Suggestion,
		availableSuggestions: Suggestion[]
	) => void;
	isLoadingSuggestions: boolean;
	abortSuggestionsLoading: () => void;
}

export function useVideoClipSuggestions( {
	registerSuggestions,
	clearSuggestions,
	messages,
	inputValue,
	disabled = false,
	style = null,
}: UseVideoClipSuggestionsParams ): UseVideoClipSuggestionsReturn {
	const lastTrackedSuggestionsRef = useRef< string >( '' );

	const { postId, postBodyText } = useSelect(
		( storeSelect ) => {
			if ( disabled ) {
				return { postId: null, postBodyText: '' };
			}
			let currentPostId: string | number | null = null;
			let rawContent = '';
			try {
				const editorSelect = storeSelect( editorStore ) as unknown as {
					getCurrentPostId?: () => string | number | null;
					getEditedPostContent?: () => string;
					getEditedPostAttribute?: ( attr: string ) => unknown;
				};
				currentPostId = editorSelect?.getCurrentPostId?.() ?? null;
				rawContent = editorSelect?.getEditedPostContent?.() ?? '';
				if ( ! rawContent ) {
					const attr = editorSelect?.getEditedPostAttribute?.( 'content' );
					if ( typeof attr === 'string' ) {
						rawContent = attr;
					}
				}
			} catch {
				currentPostId = null;
				rawContent = '';
			}
			return {
				postId: currentPostId,
				postBodyText: rawContent,
			};
		},
		[ disabled ]
	);

	const enabled = ! disabled && postBodyText.length > 0;
	// Style flavor is part of the cache key so toggling between Cinematic and
	// Highlights reuses prior results instead of refetching, and so chips
	// generated for one style never leak into the other.
	const styleKey = style === 'highlights' ? 'highlights' : 'cinematic';
	const cacheKey = enabled && postId ? `video-clip-post-${ postId }-${ styleKey }` : null;
	let prompt = '';
	if ( enabled ) {
		prompt =
			styleKey === 'highlights'
				? buildHighlightsClipSuggestionsPrompt( postBodyText )
				: buildVideoClipSuggestionsPrompt( postBodyText );
	}

	const {
		suggestions: asyncSuggestions,
		abortLoading: abortSuggestionsLoading,
		isLoading: isLoadingSuggestions,
	} = useAsyncSuggestionsLoader( {
		prompt,
		cacheKey,
		enabled,
		buildSystemPrompt: buildVideoClipSystemPrompt,
		fallbackSuggestions: EMPTY_SUGGESTIONS,
	} );

	const hasMessages = Boolean( messages?.length );
	// Treat undefined inputValue as "empty" so consumers that don't thread
	// it through still get the original behavior.
	const isInputEmpty = ! inputValue;

	useEffect( () => {
		if ( disabled ) {
			return;
		}
		if ( hasMessages ) {
			clearSuggestions?.();
			return;
		}
		// Before any message has been sent, the chip row should reflect
		// "input is empty" — same precondition as the initial load. If the
		// user has typed something, hide the chips; if they then clear the
		// input, the next render lands here with isInputEmpty = true and
		// the chips re-register below.
		if ( ! isInputEmpty ) {
			clearSuggestions?.();
			lastTrackedSuggestionsRef.current = '';
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
	}, [
		disabled,
		hasMessages,
		isInputEmpty,
		asyncSuggestions,
		registerSuggestions,
		clearSuggestions,
	] );

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
