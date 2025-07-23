import { useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import type { StoreActions, Suggestion } from '../types';

/**
 * Hook to manage suggestions for external consumers
 */
export const useSuggestions = () => {
	const { registerSuggestions, clearSuggestions } = useDispatch(
		STORE_NAME
	) as StoreActions;

	return {
		registerSuggestions: ( suggestions: Suggestion[] ) =>
			registerSuggestions( suggestions ),
		clearSuggestions: () => clearSuggestions(),
	};
};
