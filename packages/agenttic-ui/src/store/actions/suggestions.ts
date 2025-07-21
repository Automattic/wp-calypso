import type { Suggestion } from '../types';

export const setSuggestions = ( suggestions: Suggestion[] ) => ( {
	type: 'SET_SUGGESTIONS' as const,
	suggestions,
} );

export const clearSuggestions = () => ( {
	type: 'CLEAR_SUGGESTIONS' as const,
} );
