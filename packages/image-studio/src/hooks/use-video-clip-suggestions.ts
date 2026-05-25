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
 * Each chip prompt weaves together 5-7 axes drawn from a pool of eight
 * (camera, subject, lighting, texture, time-of-day, audio, palette,
 * rendering medium). Each chip leans into a distinct angle on the post
 * rather than trying to cover all 8 axes; across the three chips, the
 * seven non-medium axes should each appear at least once. Rendering
 * medium is OPT-IN — it's included only when at least one chip genuinely
 * benefits from stylization, never forced onto a chip just to cover the
 * axis (news / lifestyle / nature posts often skip it entirely).
 *
 * Each chip may also include an optional closing-direction sub-clause
 * — exposes the chat-steerable `closerStatement` affordance via example.
 */
export function buildVideoClipSuggestionsPrompt( postBody: string ): string {
	const trimmed = postBody.slice( 0, MAX_POST_BODY_CHARS );
	return `Below is the body of a WordPress post. Propose 3 rich directional prompts for an 8-second 9:16 vertical video clip that would complement the post.

Each prompt MUST be:
- Grounded in the post's subject matter (a place, object, environment, mood, or texture mentioned in the post — not the post's literal headline).
- Phrased as a single piece of visual + audio direction that weaves together 5-7 of the eight axes below (never fewer than 5). Each axis you include must contribute a distinct word or phrase you could point at — generic mood adjectives ("beautiful", "stunning", "atmospheric") do NOT count as an axis.
  - Camera (movement + lens cue: slow dolly-in 24mm wide, macro push-in, gentle parallax pan, low crane lift, held wide deep-focus, hand-held 35mm follow).
  - Subject specificity (a concrete object, place, or material from the post — never a generic noun like "scene" or "view").
  - Lighting (quality + direction + temperature + contrast: low warm raking key, soft cool ambient fill, neutral diffuse overcast, single warm practical against cool ambient, hard rim against soft fill). Describes HOW the light behaves; pair with the Time-of-day axis if you also need to say WHEN.
  - Texture / material detail (worn copper, weathered linen, polished oak, condensation on glass, matte ceramic, salt-crusted rope, moss-damp stone).
  - Time-of-day (dawn, blue hour, late afternoon, deep dusk, twilight).
  - Audio / atmosphere (a 2-5 word *instrumental* music cue or concrete non-voice ambient cue). Default to contemporary production — most cues should sound modern: "warm lo-fi, mellow Rhodes"; "downtempo electronic, ~90 bpm"; "minimal ambient electronic, ~95 bpm"; "modern neo-classical, felt piano"; "indie-electronic, analog synths". Reach for acoustic/organic ("warm acoustic folk, fingerpicked guitar") only when the post's subject genuinely calls for it. Environmental cues stay welcome and are era-neutral: "distant gull cries"; "espresso machine hiss, ceramic clink"; "wind through pines". Instrumental genre or environmental cue only — NEVER vocals, lyrics, dialogue, crowd murmur, song titles, or artists.
  - Palette (concrete hue relationships — dominant + accent, or warm-vs-cool split: "earth tones — ochre, sage, dusty cream — against a single cool slate-blue note"; "cool slate blues and graphite with a single warm amber accent"; "warm umber and brass highlights against deep teal shadows"). Name actual colors, NOT mood adjectives ("moody", "vibrant").
  - Rendering medium (OPT-IN — include ONLY when the post topic clearly calls for stylization away from photoreal): "graphic novel" for action/drama; "editorial illustration" for tech/analytical/data posts; "painterly oil" for arts/literary essays; "watercolor sketch" for travel/nature journaling; "instant-film aesthetic" for nostalgia; "whimsical hand-drawn cel animation" for character-led storytelling; "isometric pixel art" for retro tech. Use generic descriptors only — NEVER name studios, brands, artists, or copyrighted properties. Omit for news/lifestyle/food/nature — those default to photorealistic and don't need this axis.

Across the three chips, the seven non-medium axes (camera, subject, lighting, texture, time-of-day, audio, palette) should each appear at least once. Rendering medium is OPT-IN and is included only when at least one chip genuinely benefits from stylization — never force it onto a chip just to cover the axis. Don't make all three chips lean on the same axes — each chip should feel like a distinct angle on the post (e.g. one sensory / textural, one cinematic / atmospheric, one stylized / editorial).

Each chip MAY also include an optional closing-direction sub-clause (a short phrase hinting how the clip should resolve — e.g. "end on the resilience theme", "close on a quiet settled note", "land on the small-craft detail"). This exposes the chat-steerable closing-line affordance to the user. Include in 1-2 of the 3 chips; skip when no obvious resolution.

- Written as woven prose — NOT a bulleted list, NOT axis labels (do not output "Camera: ... Subject: ...").
- 60-120 words. As rich as the chosen axes warrant; do not pad.
- No trailing punctuation.
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
 * user prompt's role is purely editorial steering of that composer. The six
 * axes below are the editorial analogue of the cinematic builder's
 * cinematography axes — they map 1:1 to what generate-html-for-video
 * actually honors (lead/focus, audience, voice, structure, beat emphasis,
 * closer/CTA). Each chip weaves 2-3 of them, never cinematography.
 */
export function buildHighlightsClipSuggestionsPrompt( postBody: string ): string {
	const trimmed = postBody.slice( 0, MAX_POST_BODY_CHARS );
	return `Below is the body of a WordPress post. Propose 3 short editorial steers a user could pick to shape a 20-second summary video derived from this post.

The video is rendered automatically from the post's content — these steers DO NOT describe what it should look like. They tell the composer WHICH parts to emphasize and HOW to frame them. Editorial direction, never cinematography.

There are six steering axes. Each one you use MUST be concrete and specific to THIS post (never generic blog advice):
- **Lead**: which aspect opens the video ("Open on how the caves formed", "Start with the family's first reaction").
- **Audience**: who it's for ("For someone who's never visited", "For experienced cooks").
- **Voice**: tone register ("Punchier, drop the hedges", "More contemplative").
- **Structure**: how it's organized ("Three things to try", "Before-and-after", "What I'd do differently").
- **Emphasis**: which beats to dwell on or cut ("Spend most of it on the payoff, skip the setup", "Quick equal hits, no deep dive").
- **Closer**: how it lands ("End on the conservation note", "Close on a call to action").

Each steer MUST:
- Weave 2-3 of the six axes into ONE coherent direction — never only one axis, never more than three (a 20-second, 4-6-scene recap can't honor an over-stuffed steer).
- For EVERY axis you include, name a concrete detail lifted from THIS post — a specific activity, place, moment, person, or term the reader would recognize. A generic editorial phrase ("focus on the theme", "make it engaging", just "a contemplative tone" with nothing attached) does NOT fill an axis; each axis must carry a pointable specific from the post.
- Use 2-8 words for the chip label, 12-30 words for the steer sentence — long enough that every axis names its concrete detail, no longer.
- Stay actionable — never "Make it good" or "Be engaging".
- Carry NO camera, lighting, or visual description (those don't apply to this render path).

Well-formed example (for a post about an autumn family weekend): "For families with young kids, structure it as three weekend outings and emphasize the orchard apple-picking and the lantern-lit harvest festival" — Audience + Structure + Emphasis, each axis naming a pointable detail from the post.

Across the 3 chips, cover distinct axis combinations and distinct angles on the post — don't let two chips lean on the same pair.

POST BODY:
${ trimmed }`;
}

function buildVideoClipSystemPrompt( suggestionPrompt: string, locale: string ): string {
	return `You generate suggestion chips for a short video clip composer. You DO NOT call any tools. You DO NOT generate, edit, or modify any media. You return only JSON.

${ suggestionPrompt }

Output ONLY valid JSON matching this exact structure (no markdown, no explanation, no tool calls). The "suggestions" array MUST contain exactly 3 items:
{"suggestions":[{"label":"2-4 word chip A","prompt":"60-120-word directional prose weaving 5-7 axes (plus an optional closing-direction clause)"},{"label":"2-4 word chip B","prompt":"60-120-word directional prose weaving 5-7 axes (plus an optional closing-direction clause)"},{"label":"2-4 word chip C","prompt":"60-120-word directional prose weaving 5-7 axes (plus an optional closing-direction clause)"}]}

The chip "label" stays 2-4 words (it's tight UI real estate). The "prompt" is the rich one — 60-120 words, 5-7 axes woven into prose, with an optional closing-direction clause in 1-2 of the 3 chips.

Generate all text in the language corresponding to locale code "${ locale }" (e.g. en = English, fr = French, es = Spanish).

Output valid JSON only, nothing else.`;
}

/**
 * Highlights-specific system prompt. Constraints match the editorial user
 * prompt in buildHighlightsClipSuggestionsPrompt — 2-8 word labels, 12-30
 * word steers each weaving 2-3 of the six editorial axes with a concrete
 * post detail per axis, no cinematography. The cinematic prompt's
 * multi-axis directional language is wrong here.
 */
function buildHighlightsClipSystemPrompt( suggestionPrompt: string, locale: string ): string {
	return `You generate suggestion chips for a short summary-video composer. You DO NOT call any tools. You DO NOT generate, edit, or modify any media. You return only JSON.

${ suggestionPrompt }

Output ONLY valid JSON matching this exact structure (no markdown, no explanation, no tool calls). The "suggestions" array MUST contain exactly 3 items:
{"suggestions":[{"label":"2-8 word chip A","prompt":"12-30 word editorial steer weaving 2-3 axes, each naming a concrete post detail"},{"label":"2-8 word chip B","prompt":"12-30 word editorial steer weaving 2-3 axes, each naming a concrete post detail"},{"label":"2-8 word chip C","prompt":"12-30 word editorial steer weaving 2-3 axes, each naming a concrete post detail"}]}

The chip "label" stays 2-8 words. The "prompt" is a short editorial steer — 12-30 words weaving 2-3 of the six axes (lead / audience / voice / structure / emphasis / closer), each axis naming a concrete detail from the post. NOT cinematography.

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
	// Both return exactly 3 suggestion items, but the constraints differ:
	// the cinematic system prompt mandates 2-4 word labels and 60-120-word
	// prompts weaving 5-7 cinematography axes, whereas Highlights needs
	// 2-8 word labels and 12-30-word multi-axis editorial steers. Using the
	// cinematic builder for Highlights would force the wrong shape/length.
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
