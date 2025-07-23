import type { Suggestion } from '../types';

export const registerSuggestions = ( suggestions: Suggestion[] ) => ( {
	type: 'REGISTER_SUGGESTIONS' as const,
	suggestions,
} );

export const clearSuggestions = () => ( {
	type: 'CLEAR_SUGGESTIONS' as const,
} );
