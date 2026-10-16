import { useSelect } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';
import type { UseSuggestionsHook } from '../utils/load-external-providers';
import type { UseAgentChatReturn } from '@automattic/agenttic-client';

// Asked of providers in the floating chat; the dock passes no limit.
const FLOATING_MAX_DYNAMIC_SUGGESTIONS = 3;

interface UseDynamicSuggestionsOptions {
	useSuggestions: UseSuggestionsHook | undefined;
	isDocked: boolean;
	registerSuggestions: UseAgentChatReturn[ 'registerSuggestions' ];
	clearSuggestions: UseAgentChatReturn[ 'clearSuggestions' ];
}

/**
 * Registers the dynamic suggestions (e.g. the selected block's actions) with
 * the chat, or clears them when there are none. A click clears them, so block
 * chips register again for each newly selected block, even if unchanged.
 * `contextualSuggestionIds` lists the ones that replace the empty-view
 * suggestions, so tracking can tag them with the selected block.
 */
export function useDynamicSuggestions( {
	useSuggestions,
	isDocked,
	registerSuggestions,
	clearSuggestions,
}: UseDynamicSuggestionsOptions ) {
	const providerSuggestions = useSuggestions?.(
		isDocked ? undefined : FLOATING_MAX_DYNAMIC_SUGGESTIONS
	);
	const dynamicSuggestions = providerSuggestions?.suggestions ?? [];
	const replaceEmptyViewSuggestions = providerSuggestions?.replaceEmptyViewSuggestions === true;

	const selectedBlockClientId = useSelect( ( select ) => {
		try {
			const blockEditor = select( 'core/block-editor' ) as {
				getSelectedBlockClientId?: () => string | null;
			};
			return blockEditor?.getSelectedBlockClientId?.() ?? undefined;
		} catch {
			return undefined;
		}
	}, [] );

	const blockChipsClientId = replaceEmptyViewSuggestions ? selectedBlockClientId : undefined;

	// Keyed on content: some providers return a fresh array on each render.
	const dynamicSuggestionsKey = JSON.stringify(
		dynamicSuggestions.map( ( suggestion ) => [
			suggestion.id,
			suggestion.label,
			suggestion.prompt,
		] )
	);

	const contextualSuggestionIds = useMemo(
		() =>
			replaceEmptyViewSuggestions
				? new Set( dynamicSuggestions.map( ( suggestion ) => suggestion.id ) )
				: new Set< string >(),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ dynamicSuggestionsKey, replaceEmptyViewSuggestions ]
	);

	useEffect( () => {
		if ( dynamicSuggestions.length > 0 ) {
			registerSuggestions( dynamicSuggestions );
		} else {
			clearSuggestions();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ dynamicSuggestionsKey, blockChipsClientId, registerSuggestions, clearSuggestions ] );

	return { dynamicSuggestions, replaceEmptyViewSuggestions, contextualSuggestionIds };
}
