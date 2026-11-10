import { useSelect } from '@wordpress/data';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import formatSuggestionIds from '../utils/format-suggestion-ids';
import { recordBigSkyTracksEvent } from '../utils/tracks';
import type { Suggestion } from '@automattic/agenttic-ui';

interface UseSuggestionTrackingOptions {
	contextualSuggestionIds: Set< string >;
	hasSuggestionsToRender: boolean;
}

/**
 * Gets `option_id` by matching Agenttic's selected prompt to the original options.
 * Tracked dropdowns have an empty parent prompt, so Agenttic copies the selected
 * option's value unchanged; provider tests enforce that.
 */
function getSelectedOptionId(
	selectedSuggestion: Suggestion,
	originalSuggestion: Suggestion | undefined
): string | undefined {
	return originalSuggestion?.options?.find(
		( option ) => option.value === selectedSuggestion.prompt
	)?.id;
}

/**
 * Tracks the suggestions shown and clicked.
 *
 * Rendered: the set Agenttic reports through `onSuggestionsRendered` (truncated
 * in floating mode, hidden while collapsed), deduped on rendered ids + block
 * context. Agenttic stays silent for an unchanged set, so a block-context change
 * re-evaluates the last set here while the chat is feeding it suggestions.
 *
 * Clicked: with the chips on screen and the block context, which a click alone
 * doesn't carry.
 */
export function useSuggestionTracking( {
	contextualSuggestionIds,
	hasSuggestionsToRender,
}: UseSuggestionTrackingOptions ) {
	// The block context contextual chips are tracked with.
	const selectedBlockType = useSelect( ( select ) => {
		try {
			const blockEditor = select( 'core/block-editor' ) as {
				getSelectedBlock?: () => { name?: unknown } | null;
			};
			const blockName = blockEditor?.getSelectedBlock?.()?.name;
			return typeof blockName === 'string' && blockName ? blockName : undefined;
		} catch {
			return undefined;
		}
	}, [] );

	// Last set Agenttic reported as rendered, also the click-tracking fallback. Kept
	// across hides: Agenttic does not re-report an identical set that remounts.
	const renderedSuggestionsRef = useRef< Suggestion[] >( [] );
	const lastTrackedRef = useRef< { ids: string; blockType?: string } | null >( null );

	const trackRenderedSuggestions = useCallback(
		( rendered: Suggestion[] ) => {
			if ( rendered.length === 0 ) {
				return;
			}

			const ids = rendered.map( ( suggestion ) => suggestion.id ).join( '|' );
			const blockType =
				selectedBlockType &&
				rendered.every( ( suggestion ) => contextualSuggestionIds.has( suggestion.id ) )
					? selectedBlockType
					: undefined;
			const previous = lastTrackedRef.current;

			if (
				previous?.ids === ids &&
				( previous.blockType === blockType ||
					// The suggestion store can retain contextual chips for one render after
					// block deselection. Do not reclassify that exposure as post-level.
					( previous.blockType && ! blockType ) )
			) {
				return;
			}

			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_suggestions_rendered', {
				suggestions: formatSuggestionIds( rendered ),
				...( blockType ? { block_type: blockType } : {} ),
			} );
			lastTrackedRef.current = { ids, blockType };
		},
		[ contextualSuggestionIds, selectedBlockType ]
	);
	const trackRenderedSuggestionsRef = useRef( trackRenderedSuggestions );
	trackRenderedSuggestionsRef.current = trackRenderedSuggestions;

	// Stable so Agenttic's reporter is never re-triggered by re-renders here.
	const onSuggestionsRendered = useCallback( ( rendered: Suggestion[] ) => {
		renderedSuggestionsRef.current = rendered;
		trackRenderedSuggestionsRef.current( rendered );
	}, [] );

	// The same rendered set is a distinct exposure once the block context changes;
	// while nothing is fed, nothing is on screen to re-track.
	useEffect( () => {
		if ( hasSuggestionsToRender ) {
			trackRenderedSuggestions( renderedSuggestionsRef.current );
		}
	}, [ hasSuggestionsToRender, trackRenderedSuggestions ] );

	const trackSuggestionClick = useCallback(
		(
			suggestion: Suggestion | string,
			availableSuggestions?: Suggestion[],
			isInMessage = false
		) => {
			if ( typeof suggestion === 'string' ) {
				return;
			}

			// Agenttic reports the list a click came from; without one, fall back to
			// what it reported as rendered.
			const renderedSuggestions = renderedSuggestionsRef.current;
			const knownSuggestions = availableSuggestions?.length
				? availableSuggestions
				: renderedSuggestions;
			const originalSuggestion = knownSuggestions.find(
				( knownSuggestion ) => knownSuggestion.id === suggestion.id
			);
			const optionId = getSelectedOptionId( suggestion, originalSuggestion );
			const blockType = contextualSuggestionIds.has( suggestion.id )
				? selectedBlockType
				: undefined;

			// What Agenttic reported as rendered was on screen, so it wins, except for a
			// list in a message, which Agenttic doesn't report.
			const isRendered =
				! isInMessage &&
				renderedSuggestions.some(
					( renderedSuggestion ) => renderedSuggestion.id === suggestion.id
				);
			const shownSuggestions = isRendered ? renderedSuggestions : knownSuggestions;

			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_suggestion_click', {
				suggestion_text: suggestion.prompt || '',
				suggestion_id: suggestion.id || '',
				available_suggestions: formatSuggestionIds( shownSuggestions ),
				...( optionId ? { option_id: optionId } : {} ),
				...( blockType ? { block_type: blockType } : {} ),
			} );
		},
		[ contextualSuggestionIds, selectedBlockType ]
	);

	return { onSuggestionsRendered, trackSuggestionClick };
}
