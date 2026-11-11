import type { Suggestion } from '@automattic/agenttic-ui';

interface SuggestionClickContextOptions {
	selectedSuggestion: Suggestion | string;
	/** The list Agenttic reports with the click. */
	availableSuggestions?: Suggestion[];
	/** The chips registered for the footer, before their labels are formatted. */
	footerSuggestions: Suggestion[];
	hasMessages: boolean;
}

interface SuggestionClickContext {
	/** The suggestions to report the click with. */
	knownSuggestions: Suggestion[];
	/** Whether the click came from a list inside a message. */
	isInMessage: boolean;
}

/**
 * Where a suggestion click came from. Footer chips map back to their unformatted
 * originals; any other list (the empty view, a list in a message) reports its
 * own suggestions. The empty view shows only before the first message.
 */
export function getSuggestionClickContext( {
	selectedSuggestion,
	availableSuggestions,
	footerSuggestions,
	hasMessages,
}: SuggestionClickContextOptions ): SuggestionClickContext {
	const isFooterSuggestion =
		typeof selectedSuggestion === 'string' ||
		footerSuggestions.some( ( suggestion ) => suggestion.id === selectedSuggestion.id );

	if ( isFooterSuggestion ) {
		return { knownSuggestions: footerSuggestions, isInMessage: false };
	}

	return { knownSuggestions: availableSuggestions ?? footerSuggestions, isInMessage: hasMessages };
}
