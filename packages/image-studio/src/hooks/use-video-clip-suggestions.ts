import { type Suggestion } from '@automattic/agenttic-client';
import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { ImageStudioEntryPoint } from '../store';
import { ImageStudioMode } from '../types';
import { formatSuggestionIds } from '../utils/agenttic-tracking';
import {
	trackImageStudioSuggestionClick,
	trackImageStudioSuggestionsRendered,
} from '../utils/tracking';
import { useAsyncSuggestionsLoader } from './use-async-suggestions-loader';
import type { AgentMessage } from '../types/agenttic';

/**
 * Maximum number of post body characters to inline into the suggestions
 * prompt. The LLM only needs enough text to extract concrete visual
 * subjects; sending more wastes context.
 */
const MAX_POST_BODY_CHARS = 2000;

/**
 * Strip HTML tags and Gutenberg block delimiter comments from a post-body
 * string so that the LLM sees plain text instead of markup soup.
 */
export function postBodyToPlainText( raw: string ): string {
	if ( ! raw ) {
		return '';
	}

	return (
		raw
			// Gutenberg block delimiter comments e.g. <!-- wp:paragraph -->
			.replace( /<!--[\s\S]*?-->/g, ' ' )
			// HTML tags
			.replace( /<\/?[^>]+>/g, ' ' )
			// Decode the handful of entities that show up most often in post bodies.
			.replace( /&nbsp;/g, ' ' )
			.replace( /&amp;/g, '&' )
			.replace( /&lt;/g, '<' )
			.replace( /&gt;/g, '>' )
			.replace( /&quot;/g, '"' )
			.replace( /&#039;/g, "'" )
			.replace( /\s+/g, ' ' )
			.trim()
	);
}

/**
 * Build the prompt sent to the suggestions endpoint for the feature-clip
 * (video) flow. The post body is inlined verbatim so the LLM never has to
 * resolve a server-side `[[client.gutenberg_page.simple_structure]]`
 * placeholder — the suggestions endpoint does not run that substitution.
 */
export function buildVideoClipSuggestionsPrompt( postBody: string ): string {
	const trimmed = postBody.slice( 0, MAX_POST_BODY_CHARS );
	return `Below is the body of a WordPress post. Generate exactly 3 short, evocative video-clip prompts that a creator might want to make from this content. Each ≤120 chars, single sentence, focuses on a concrete visual subject + one sensory detail + a hint of motion. NEVER include cinematography terms (cinematic, documentary, aerial, macro, drone, slow-motion, time-lapse), tone words (informative, promotional, educational, salesy), camera/lens jargon, or on-screen text. Output ONLY a JSON array of 3 strings, no preamble.

POST BODY:
${ trimmed }`;
}

interface UseVideoClipSuggestionsParams {
	registerSuggestions?: ( suggestions: Suggestion[] ) => void;
	clearSuggestions?: () => void;
	messages?: AgentMessage[];
	mode?: ImageStudioMode;
	entryPoint: ImageStudioEntryPoint | null;
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
 * Hook that drives suggestion chips for the post-editor "Generate Feature
 * Clip" flow.
 *
 * Reads the active post body directly from the block editor on the client
 * (via `core/editor` `getEditedPostContent`), strips it to plain text, and
 * inlines it into the suggestions prompt. This guarantees the LLM sees the
 * real post body regardless of whether the suggestions endpoint resolves
 * `[[client.gutenberg_page.simple_structure]]` style placeholders.
 *
 * The hook is a no-op for any entry point other than
 * `PostEditorFeatureClip`, so it can be called unconditionally alongside
 * `useImageStudioSuggestions` without violating the rules of hooks.
 */
export function useVideoClipSuggestions( {
	registerSuggestions,
	clearSuggestions,
	messages,
	mode,
	entryPoint,
}: UseVideoClipSuggestionsParams ): UseVideoClipSuggestionsReturn {
	const isFeatureClip = entryPoint === ImageStudioEntryPoint.PostEditorFeatureClip;
	const lastTrackedSuggestionsRef = useRef< string >( '' );

	const { postId, postBodyText } = useSelect(
		( storeSelect ) => {
			if ( ! isFeatureClip ) {
				return { postId: null as string | number | null, postBodyText: '' };
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
				// eslint-disable-next-line no-console
				console.debug( '[Image Studio] Failed to read post content for video-clip suggestions.' );
			}
			return {
				postId: currentPostId,
				postBodyText: postBodyToPlainText( rawContent ),
			};
		},
		[ isFeatureClip ]
	);

	const enabled = isFeatureClip && mode === ImageStudioMode.Generate && postBodyText.length > 0;

	const cacheKey = enabled && postId ? `feature-clip-post-${ postId }` : null;
	const prompt = enabled ? buildVideoClipSuggestionsPrompt( postBodyText ) : '';

	const {
		suggestions: asyncSuggestions,
		abortLoading: abortSuggestionsLoading,
		isLoading: isLoadingSuggestions,
	} = useAsyncSuggestionsLoader( {
		prompt,
		cacheKey,
		enabled,
	} );

	useEffect( () => {
		if ( ! isFeatureClip ) {
			return;
		}

		// Once the user has started chatting, suggestions are cleared so they
		// don't compete with the conversation.
		if ( messages?.length ) {
			clearSuggestions?.();
			return;
		}

		if ( asyncSuggestions.length === 0 ) {
			return;
		}

		registerSuggestions?.( asyncSuggestions );

		const suggestionIds = formatSuggestionIds( asyncSuggestions );
		if ( suggestionIds !== lastTrackedSuggestionsRef.current ) {
			lastTrackedSuggestionsRef.current = suggestionIds;
			trackImageStudioSuggestionsRendered( {
				suggestions: suggestionIds,
				mode: mode || ImageStudioMode.Generate,
				suggestionType: 'default',
			} );
		}
	}, [
		isFeatureClip,
		asyncSuggestions,
		messages?.length,
		registerSuggestions,
		clearSuggestions,
		mode,
	] );

	const handleSuggestionClick = useCallback(
		( selectedSuggestion: Suggestion, availableSuggestions: Suggestion[] ) => {
			trackImageStudioSuggestionClick( {
				suggestionId: selectedSuggestion.id || '',
				suggestionText: selectedSuggestion.prompt || '',
				availableSuggestions: formatSuggestionIds( availableSuggestions ),
				mode: mode || ImageStudioMode.Generate,
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
