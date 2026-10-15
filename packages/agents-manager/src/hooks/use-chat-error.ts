import { useEffect } from '@wordpress/element';
import {
	getOrchestratorErrorMessage,
	getOrchestratorErrorType,
} from '../utils/orchestrator-error-message';
import { getReaderChatErrorMessage } from '../utils/reader-chat-error-message';
import { recordAgentsManagerTracksEvent } from '../utils/tracks';
import type { UseCreditsResult } from './use-credits';

interface UseChatErrorOptions {
	error: string | null;
	isReaderChat: boolean;
	takeRefusalCode: UseCreditsResult[ 'takeRefusalCode' ];
}

/**
 * Gets the message to show for a chat error, and records one event per error
 * shown. `error` returns to null between attempts, so the same failure
 * repeating on a later send counts again.
 */
export function useChatError( { error, isReaderChat, takeRefusalCode }: UseChatErrorOptions ) {
	useEffect( () => {
		if ( error ) {
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_error', {
				error_type: getOrchestratorErrorType( error, takeRefusalCode() ),
			} );
		}
	}, [ error, takeRefusalCode ] );

	return isReaderChat ? getReaderChatErrorMessage( error ) : getOrchestratorErrorMessage( error );
}
