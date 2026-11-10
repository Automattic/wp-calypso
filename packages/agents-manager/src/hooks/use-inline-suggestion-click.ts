import { useCallback, useEffect } from '@wordpress/element';
import type { Suggestion } from '@automattic/agenttic-ui';

// Shared with providers: WooCommerce AI dispatches it, and the Jetpack AI sidebar listens for it.
const INLINE_SUGGESTION_CLICK_EVENT = 'big-sky-inline-suggestion-click';

interface InlineSuggestionClickDetail {
	value?: string;
	/** Agenttic already sent the suggestion and cleared the input. */
	autoSubmit?: boolean;
	suggestionId?: string;
}

/**
 * Routes suggestion clicks through the shared inline-suggestion window event,
 * so provider listeners (e.g. the Jetpack AI sidebar hiding the clicked chip) see
 * every click, and fills the composer with any click that isn't auto-submitted.
 */
export function useInlineSuggestionClick( setChatInput: ( value: string ) => void ) {
	useEffect( () => {
		const handleInlineSuggestionClick = ( event: Event ) => {
			const { value, autoSubmit } = ( event as CustomEvent< InlineSuggestionClickDetail > ).detail;

			// Refilling the input after an auto-submit would leave the prompt stuck in
			// the composer.
			if ( ! value || autoSubmit ) {
				return;
			}

			setChatInput( value.endsWith( ' ' ) ? value : `${ value } ` );
		};

		window.addEventListener( INLINE_SUGGESTION_CLICK_EVENT, handleInlineSuggestionClick );
		return () => {
			window.removeEventListener( INLINE_SUGGESTION_CLICK_EVENT, handleInlineSuggestionClick );
		};
	}, [ setChatInput ] );

	return useCallback( ( suggestion: Suggestion | string ) => {
		const isPromptString = typeof suggestion === 'string';
		const value = isPromptString ? suggestion : ( suggestion.prompt ?? suggestion.label );

		window.dispatchEvent(
			new CustomEvent< InlineSuggestionClickDetail >( INLINE_SUGGESTION_CLICK_EVENT, {
				detail: {
					value,
					autoSubmit: ! isPromptString && !! suggestion.autoSubmit,
					...( ! isPromptString && suggestion.id ? { suggestionId: suggestion.id } : {} ),
				},
			} )
		);
	}, [] );
}
