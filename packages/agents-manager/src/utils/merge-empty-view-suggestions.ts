import { DEFAULT_EMPTY_VIEW_SUGGESTION_IDS } from '../hooks/use-empty-view-suggestions';
import type { Suggestion } from '../types';

const DEFAULT_EMPTY_VIEW_SUGGESTION_ID_SET = new Set< string >(
	Object.values( DEFAULT_EMPTY_VIEW_SUGGESTION_IDS )
);

function isDefaultEmptyViewSuggestions( suggestions: Suggestion[] ): boolean {
	return (
		suggestions.length > 0 &&
		suggestions.every( ( suggestion ) => DEFAULT_EMPTY_VIEW_SUGGESTION_ID_SET.has( suggestion.id ) )
	);
}

export function mergeEmptyViewSuggestions(
	emptyViewSuggestions: Suggestion[],
	dynamicSuggestions: Suggestion[],
	replaceEmptyViewSuggestions = false
): Suggestion[] {
	if ( dynamicSuggestions.length === 0 && ! replaceEmptyViewSuggestions ) {
		return emptyViewSuggestions;
	}

	const combined: Suggestion[] = [];
	const seenIds = new Set< string >();
	// Contextual suggestions always replace the empty view when requested.
	// Otherwise they replace generic defaults and extend custom provider chips.
	const baseSuggestions =
		replaceEmptyViewSuggestions || isDefaultEmptyViewSuggestions( emptyViewSuggestions )
			? []
			: emptyViewSuggestions;

	for ( const suggestion of [ ...baseSuggestions, ...dynamicSuggestions ] ) {
		if ( ! seenIds.has( suggestion.id ) ) {
			seenIds.add( suggestion.id );
			combined.push( suggestion );
		}
	}

	return combined;
}
