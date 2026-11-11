import { useCallback } from '@wordpress/element';
import { getSuggestionClickContext } from '../utils/get-suggestion-click-context';
import { getSuggestionClickPayload } from '../utils/get-suggestion-click-payload';
import type { Suggestion } from '@automattic/agenttic-ui';

export type SuggestionClickHandler = (
	selectedSuggestion: Suggestion | string,
	availableSuggestions?: Suggestion[],
	isInMessage?: boolean
) => void;

interface UseAgentticSuggestionClickOptions {
	/** The chips registered for the footer, before their labels are formatted. */
	suggestions: Suggestion[];
	hasMessages: boolean;
	onSuggestionClick?: SuggestionClickHandler;
}

/**
 * Adapts Agenttic's suggestion clicks for the chat. Agenttic hands back the
 * formatted footer chips, so footer clicks map back to the originals; a list in
 * a message, which Agenttic doesn't report as rendered, is flagged so tracking
 * uses its own suggestions.
 */
export function useAgentticSuggestionClick( {
	suggestions,
	hasMessages,
	onSuggestionClick,
}: UseAgentticSuggestionClickOptions ) {
	return useCallback(
		( selectedSuggestion: Suggestion | string, availableSuggestions?: Suggestion[] ) => {
			const { knownSuggestions, isInMessage } = getSuggestionClickContext( {
				selectedSuggestion,
				availableSuggestions,
				footerSuggestions: suggestions,
				hasMessages,
			} );

			onSuggestionClick?.(
				getSuggestionClickPayload( selectedSuggestion, knownSuggestions ),
				knownSuggestions,
				isInMessage
			);
		},
		[ hasMessages, onSuggestionClick, suggestions ]
	);
}
