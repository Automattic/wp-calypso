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
 * Each prompt deliberately combines THREE descriptive axes drawn from a
 * pool of six (camera, subject, lighting, texture, time-of-day, audio).
 * Two-axis prompts read thin to Veo; three concrete axes — woven into
 * prose, each contributing a distinct word or phrase — give the model
 * enough hooks to commit to a specific shot rather than averaging toward
 * generic "scenic" output.
 */
export function buildVideoClipSuggestionsPrompt( postBody: string ): string {
	const trimmed = postBody.slice( 0, MAX_POST_BODY_CHARS );
	return `Below is the body of a WordPress post. Propose 3 dense directional prompts for an 8-second 9:16 vertical video clip that would complement the post.

Each prompt MUST be:
- Grounded in the post's subject matter (a place, object, environment, mood, or texture mentioned in the post — not the post's literal headline).
- Phrased as a single piece of visual + audio direction that COMBINES THREE of the six axes below (never fewer than three). The three chosen axes must each contribute a distinct word or phrase you could point at — generic mood adjectives ("beautiful", "stunning", "atmospheric") do NOT count as an axis.
  - Camera (movement + lens cue: slow dolly-in 24mm wide, macro push-in, gentle parallax pan, low crane lift, held wide deep-focus, hand-held 35mm follow).
  - Subject specificity (a concrete object, place, or material from the post — never a generic noun like "scene" or "view").
  - Lighting (quality + direction + temperature + contrast: low warm raking key, soft cool ambient fill, neutral diffuse overcast, single warm practical against cool ambient, hard rim against soft fill). Describes HOW the light behaves; pair with the Time-of-day axis if you also need to say WHEN.
  - Texture / material detail (worn copper, weathered linen, polished oak, condensation on glass, matte ceramic, salt-crusted rope, moss-damp stone).
  - Time-of-day (dawn, blue hour, late afternoon, deep dusk, twilight).
  - Audio / atmosphere (a 2-5 word *instrumental* music cue or concrete non-voice ambient cue: "warm acoustic folk, fingerpicked guitar"; "minimal ambient electronic, ~95 bpm"; "instrumental jazz, brushed drums"; "distant gull cries"; "espresso machine hiss, ceramic clink"; "wind through pines"). Instrumental genre or environmental cue only — NEVER vocals, lyrics, dialogue, crowd murmur, song titles, or artists.
- Written as woven prose — NOT a bulleted list, NOT axis labels (do not output "Camera: ... Subject: ...").
- 35-60 words, no trailing punctuation.
- People may appear — only adults, no children or minors. Describe them generically (e.g. "a barista", "a hiker") with no named individuals, public figures, or recognizable likenesses.
- Free of crowds, on-screen text, signage, dialogue, or copyrighted properties — these are non-negotiable for the safety pipeline.

POST BODY:
${ trimmed }`;
}

function buildVideoClipSystemPrompt( suggestionPrompt: string, locale: string ): string {
	return `You generate suggestion chips for a short video clip composer. You DO NOT call any tools. You DO NOT generate, edit, or modify any media. You return only JSON.

${ suggestionPrompt }

Output ONLY valid JSON matching this exact structure (no markdown, no explanation, no tool calls). The "suggestions" array MUST contain exactly 3 items:
{"suggestions":[{"label":"2-4 word chip A","prompt":"35-60 word directional sentence combining three axes"},{"label":"2-4 word chip B","prompt":"35-60 word directional sentence combining three axes"},{"label":"2-4 word chip C","prompt":"35-60 word directional sentence combining three axes"}]}

The chip "label" stays 2-4 words (it's tight UI real estate). The "prompt" is the dense one — 35-60 words, three axes woven into prose.

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
	const cacheKey = enabled && postId ? `video-clip-post-${ postId }` : null;
	const prompt = enabled ? buildVideoClipSuggestionsPrompt( postBodyText ) : '';

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
