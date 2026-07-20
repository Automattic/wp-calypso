import type { Suggestion } from '@automattic/agenttic-ui';

export default function getSuggestionClickPayload(
	selectedSuggestion: Suggestion | string,
	availableSuggestions: Suggestion[]
): Suggestion | string {
	if ( typeof selectedSuggestion === 'string' ) {
		return selectedSuggestion;
	}

	const originalSuggestion = availableSuggestions.find(
		( suggestion ) => suggestion.id === selectedSuggestion.id
	);
	if ( ! originalSuggestion ) {
		return selectedSuggestion;
	}

	return {
		...selectedSuggestion,
		...originalSuggestion,
		...( selectedSuggestion.prompt !== undefined ? { prompt: selectedSuggestion.prompt } : {} ),
	};
}
