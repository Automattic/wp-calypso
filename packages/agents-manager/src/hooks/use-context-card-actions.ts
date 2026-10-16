import { useCallback } from '@wordpress/element';
import {
	removeExternalContextCard,
	removeExternalContextEntry,
	type ExternalContextCard,
	type ExternalContextCardAction,
} from '../utils/external-context';
import type { UseCreditsResult } from './use-credits';

interface UseContextCardActionsOptions {
	beforeSubmit: UseCreditsResult[ 'beforeSubmit' ];
	submitChatMessage: ( message: string ) => Promise< void >;
	setChatInput: ( value: string ) => void;
}

/**
 * Handles the buttons on external context cards: a card's action either sends
 * its prompt or puts it in the composer, and dismissing a card drops the
 * context it carries.
 */
export function useContextCardActions( {
	beforeSubmit,
	submitChatMessage,
	setChatInput,
}: UseContextCardActionsOptions ) {
	const handleContextCardAction = useCallback(
		( card: ExternalContextCard, action: ExternalContextCardAction ) => {
			if ( ! action.prompt ) {
				return;
			}

			// A send blocked on credits keeps the card, so it can be retried once
			// credits are back.
			if ( action.type === 'submit' && ! beforeSubmit() ) {
				return;
			}

			// Collapse the card right away. A submit's context entry stays until the
			// message is sent, which consumes it.
			removeExternalContextCard( card.id );

			if ( action.type === 'submit' ) {
				void submitChatMessage( action.prompt );
				return;
			}

			setChatInput( action.prompt );
		},
		[ beforeSubmit, setChatInput, submitChatMessage ]
	);

	const dismissContextCard = useCallback( ( card: ExternalContextCard ) => {
		removeExternalContextCard( card.id );
		card.contextEntryIds?.forEach( ( entryId ) => {
			removeExternalContextEntry( entryId );
		} );
	}, [] );

	return { handleContextCardAction, dismissContextCard };
}
