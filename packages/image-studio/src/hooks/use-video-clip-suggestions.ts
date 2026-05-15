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

/**
 * Suggestions for the Highlights style. The Highlights flow doesn't use the
 * user prompt to describe what the video should LOOK like — the cloud render
 * path (wpcom/generate-html-for-video → wpcom/generate-video-for-studio with
 * mode='editframe') composes the HTML server-side from the post itself. The
 * user prompt's role here is purely steering the agent: angle, audience,
 * voice, structure. So suggestions here are short framing hints, not
 * cinematography.
 */
export function buildHighlightsClipSuggestionsPrompt( postBody: string ): string {
	const trimmed = postBody.slice( 0, MAX_POST_BODY_CHARS );
	return `Below is the body of a WordPress post. Propose 3 short framing hints a user could pick to steer a 20-second summary video derived from this post.

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
{"suggestions":[{"label":"2-4 word chip A","prompt":"35-60 word directional sentence combining three axes"},{"label":"2-4 word chip B","prompt":"35-60 word directional sentence combining three axes"},{"label":"2-4 word chip C","prompt":"35-60 word directional sentence combining three axes"}]}

The chip "label" stays 2-4 words (it's tight UI real estate). The "prompt" is the dense one — 35-60 words, three axes woven into prose.

Generate all text in the language corresponding to locale code "${ locale }" (e.g. en = English, fr = French, es = Spanish).

Output valid JSON only, nothing else.`;
}

/**
 * Highlights-specific system prompt. Constraints match the editorial user
 * prompt in buildHighlightsClipSuggestionsPrompt — 2-8 word labels, 6-15
 * word prompt sentences, no cinematography axes. The cinematic prompt's
 * "three axes" language is wrong for this style.
 */
function buildHighlightsClipSystemPrompt( suggestionPrompt: string, locale: string ): string {
	return `You generate suggestion chips for a short summary-video composer. You DO NOT call any tools. You DO NOT generate, edit, or modify any media. You return only JSON.

${ suggestionPrompt }

Output ONLY valid JSON matching this exact structure (no markdown, no explanation, no tool calls). The "suggestions" array MUST contain exactly 3 items:
{"suggestions":[{"label":"2-8 word chip A","prompt":"6-15 word editorial steering sentence"},{"label":"2-8 word chip B","prompt":"6-15 word editorial steering sentence"},{"label":"2-8 word chip C","prompt":"6-15 word editorial steering sentence"}]}

The chip "label" stays 2-8 words. The "prompt" is a short editorial direction — 6-15 words, framing the angle / audience / structure / voice. NOT cinematography.

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
	 * the loader uses — Cinematic gets cinematography-flavored chips
	 * (camera/lighting/audio direction for the Veo render path);
	 * Highlights gets framing/steering chips that nudge the agent's
	 * editorial angle when it composes the cloud-rendered recap. Cache
	 * key includes the style so toggling between them reuses prior
	 * results without re-fetching.
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

	// Pair the right system-prompt builder with the user-prompt variant.
	// The cinematic system prompt hard-codes the three-axes JSON shape that
	// conflicts with the editorial Highlights user prompt.
	const buildSystemPrompt =
		styleKey === 'highlights' ? buildHighlightsClipSystemPrompt : buildVideoClipSystemPrompt;

	const {
		suggestions: asyncSuggestions,
		abortLoading: abortSuggestionsLoading,
		isLoading: isLoadingSuggestions,
	} = useAsyncSuggestionsLoader( {
		prompt,
		cacheKey,
		enabled,
		buildSystemPrompt,
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
