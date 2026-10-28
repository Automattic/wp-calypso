import { useCallback } from '@wordpress/element';
import { startNewUserRequest } from '../utils/canvas-binding';
import { recordAgentsManagerTracksEvent } from '../utils/tracks';
import type { UseCreditsResult } from './use-credits';
import type { UIMessage, UseAgentChatReturn } from '@automattic/agenttic-client';

interface UseGatedRegenerateHandlerOptions {
	getRegenerateHandler: UseAgentChatReturn[ 'getRegenerateHandler' ];
	beforeSubmit: UseCreditsResult[ 'beforeSubmit' ];
	/** Resets the turn state the regeneration rewinds. */
	onRegenerationStart: ( messageId: string | undefined ) => void;
	onRegenerationEnd: () => void;
}

/**
 * Wraps Agenttic's regenerate handler: a regeneration is a new agent request,
 * so it takes the same credits gate as a send and starts a new canvas binding,
 * and it rewinds the turn state the regenerated reply left behind.
 */
export function useGatedRegenerateHandler( {
	getRegenerateHandler,
	beforeSubmit,
	onRegenerationStart,
	onRegenerationEnd,
}: UseGatedRegenerateHandlerOptions ) {
	return useCallback(
		( message?: UIMessage ) => {
			const handler = getRegenerateHandler?.( message );
			if ( ! handler ) {
				return handler;
			}

			return async () => {
				if ( ! beforeSubmit() ) {
					return;
				}

				// A regenerate says the reply was not good enough: the clearest
				// quality signal the chat has after a thumbs down.
				recordAgentsManagerTracksEvent( 'calypso_agents_manager_response_action_regenerate', {
					...( message?.id ? { message_id: message.id } : {} ),
				} );

				onRegenerationStart( message?.id );

				// The regeneration rebinds via `getClientContext()` on its own outbound
				// message; a previous request's block would refuse its canvas writes.
				startNewUserRequest();

				try {
					await handler();
				} finally {
					onRegenerationEnd();
				}
			};
		},
		[ beforeSubmit, getRegenerateHandler, onRegenerationEnd, onRegenerationStart ]
	);
}
