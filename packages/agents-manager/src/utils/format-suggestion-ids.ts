import type { Suggestion } from '../types';

/**
 * Pipe-delimited list of suggestion ids (e.g. `|id1|id2|`), matching Big Sky's
 * `suggestions` / `available_suggestions` tracks-prop format.
 */
export default function formatSuggestionIds( suggestions: Suggestion[] ): string {
	return '|' + suggestions.map( ( suggestion ) => suggestion.id ).join( '|' ) + '|';
}
