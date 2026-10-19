import { DEFAULT_EMPTY_VIEW_SUGGESTION_IDS } from '../hooks/use-empty-view-suggestions';
import type { Suggestion } from '@automattic/agenttic-ui';

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

interface GetDisplayedEmptyViewSuggestionsOptions {
	/** Whether the layout shows the chat; Agenttic can't tell when it's hidden. */
	isVisible: boolean;
	/** Loaded, with no messages: the empty-view chips stay until a message is sent. */
	isChatEmpty: boolean;
	emptyViewSuggestions: Suggestion[];
	registeredSuggestions: Suggestion[];
	dynamicSuggestions: Suggestion[];
	replaceEmptyViewSuggestions: boolean;
}

/**
 * The chips to feed Agenttic: the empty-view chips merged with the registered
 * ones (or the provider's live output) while the chat is empty, the registered
 * ones once it isn't, and none while hidden.
 */
export function getDisplayedEmptyViewSuggestions( {
	isVisible,
	isChatEmpty,
	emptyViewSuggestions,
	registeredSuggestions,
	dynamicSuggestions,
	replaceEmptyViewSuggestions,
}: GetDisplayedEmptyViewSuggestionsOptions ): Suggestion[] {
	if ( ! isVisible ) {
		return [];
	}

	if ( ! isChatEmpty ) {
		return registeredSuggestions;
	}

	// A suggestion click empties the registered store, and nothing re-registers
	// unchanged provider output, so fall back to that output to keep the chips.
	const shouldUseDynamicSuggestions =
		replaceEmptyViewSuggestions || registeredSuggestions.length === 0;

	return mergeEmptyViewSuggestions(
		emptyViewSuggestions,
		shouldUseDynamicSuggestions ? dynamicSuggestions : registeredSuggestions,
		replaceEmptyViewSuggestions
	);
}
