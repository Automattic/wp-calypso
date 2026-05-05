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

/**
 * Strip HTML tags and Gutenberg block-delimiter comments out of a post-body
 * string so the LLM sees plain text instead of markup soup.
 */
export function postBodyToPlainText( raw: string ): string {
	if ( ! raw ) {
		return '';
	}

	return raw
		.replace( /<!--[\s\S]*?-->/g, ' ' )
		.replace( /<\/?[^>]+>/g, ' ' )
		.replace( /&nbsp;/g, ' ' )
		.replace( /&amp;/g, '&' )
		.replace( /&lt;/g, '<' )
		.replace( /&gt;/g, '>' )
		.replace( /&quot;/g, '"' )
		.replace( /&#039;/g, "'" )
		.replace( /\s+/g, ' ' )
		.trim();
}

/**
 * The post body is inlined verbatim because the suggestions endpoint does
 * not run server-side `[[client.gutenberg_page.simple_structure]]`
 * substitution — sending that placeholder leaves the LLM with no context
 * and an active video tool, and it ends up calling the tool instead of
 * returning chips.
 */
export function buildVideoClipSuggestionsPrompt( postBody: string ): string {
	const trimmed = postBody.slice( 0, MAX_POST_BODY_CHARS );
	return `Below is the body of a WordPress post. Propose 3 short directional prompts for an 8-second 9:16 vertical video clip that would complement the post.

Each prompt MUST be:
- Grounded in the post's subject matter (a place, object, environment, mood, or texture mentioned in the post — not the post's literal headline).
- Phrased as a single piece of visual direction: choose ONE of camera move (slow drift, gentle pan, dolly-in, crane, held wide), framing (wide, low-angle, establishing), or aesthetic register (golden hour, naturalistic light, contemplative, motion-rich, energetic).
- 8-14 words, no trailing punctuation.
- Free of people, faces, hands, crowds, signage, on-screen text, dialogue, or copyrighted properties.

POST BODY:
${ trimmed }`;
}

function buildVideoClipSystemPrompt( suggestionPrompt: string, locale: string ): string {
	return `You generate suggestion chips for a short video clip composer. You DO NOT call any tools. You DO NOT generate, edit, or modify any media. You return only JSON.

${ suggestionPrompt }

Output ONLY valid JSON matching this exact structure (no markdown, no explanation, no tool calls):
{"suggestions":[{"label":"2-4 word chip","prompt":"8-14 word directional sentence"}]}

Generate all text in the language corresponding to locale code "${ locale }" (e.g. en = English, fr = French, es = Spanish).

Output valid JSON only, nothing else.`;
}

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

export function useVideoClipSuggestions( {
	registerSuggestions,
	clearSuggestions,
	messages,
	disabled = false,
}: UseVideoClipSuggestionsParams ): UseVideoClipSuggestionsReturn {
	const lastTrackedSuggestionsRef = useRef< string >( '' );

	const { postId, postBodyText } = useSelect( ( storeSelect ) => {
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
			postBodyText: postBodyToPlainText( rawContent ),
		};
	}, [] );

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
	} );

	const hasMessages = Boolean( messages?.length );

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
