import { useEffect, useRef, useState } from 'react';
import type { SupportInteraction } from '../../types';

interface UseChatMessagesReturn {
	clearMessages: () => void;
}

/**
 * Detects interaction changes and triggers resets.
 */
export const useInteractionSync = (
	currentInteraction: SupportInteraction | undefined,
	messages: UseChatMessagesReturn
) => {
	const previousIdRef = useRef< string | undefined >();
	const [ hasChanged, setHasChanged ] = useState( false );

	useEffect( () => {
		const currentId = currentInteraction?.uuid;
		const previousId = previousIdRef.current;

		// Detect change
		if ( currentId !== previousId ) {
			setHasChanged( true );

			// If interaction cleared (new chat), clear messages
			if ( ! currentId ) {
				messages.clearMessages();
			}

			previousIdRef.current = currentId;
		} else {
			setHasChanged( false );
		}
		// Only depend on the interaction ID and the clearMessages function, not the entire messages object
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ currentInteraction?.uuid, messages.clearMessages ] );

	return {
		interactionId: currentInteraction?.uuid ?? null,
		hasChanged,
	};
};
