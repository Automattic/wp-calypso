import { useCallback, useEffect, useRef } from '@wordpress/element';
import formatSuggestionIds from '../utils/format-suggestion-ids';
import { recordBigSkyTracksEvent } from '../utils/tracks';
import type { Suggestion } from '../types';

interface Options {
	selectedBlockType?: string;
	contextualSuggestionIds: Set< string >;
	hasSuggestionsToRender: boolean;
}

/**
 * Tracks `jetpack_big_sky_chat_suggestions_rendered` from the set Agenttic reports
 * through `onSuggestionsRendered` ( truncated in floating mode, hidden while
 * collapsed ), deduped on rendered ids + block context. Agenttic stays silent for
 * an unchanged set, so a block-context change re-evaluates the last set here.
 */
export default function useSuggestionsRenderedTracking( {
	selectedBlockType,
	contextualSuggestionIds,
	hasSuggestionsToRender,
}: Options ) {
	// Last set Agenttic reported as rendered; also the click-tracking fallback.
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

	useEffect( () => {
		if ( ! hasSuggestionsToRender ) {
			renderedSuggestionsRef.current = [];
		}
	}, [ hasSuggestionsToRender ] );

	// The same rendered set is a distinct exposure once the block context changes.
	useEffect( () => {
		trackRenderedSuggestions( renderedSuggestionsRef.current );
	}, [ trackRenderedSuggestions ] );

	return { onSuggestionsRendered, renderedSuggestionsRef };
}
