import { useEffect } from '@wordpress/element';
import {
	getOrchestratorErrorMessage,
	getOrchestratorErrorType,
} from '../utils/orchestrator-error-message';
import { getReaderChatErrorMessage } from '../utils/reader-chat-error-message';
import { recordAgentsManagerTracksEvent } from '../utils/tracks';
import type { UseCreditsResult } from './use-credits';
import type { NoticeConfig } from '@automattic/agenttic-ui';

interface UseChatErrorOptions {
	error: string | null;
	isReaderChat: boolean;
	takeRefusalCode: UseCreditsResult[ 'takeRefusalCode' ];
	refusalNotice: UseCreditsResult[ 'refusalNotice' ];
}

interface ChatError {
	message: string | null;
	/** Shown in the thread in place of `message`. */
	notice?: NoticeConfig;
}

/**
 * Gets a chat error's text, or the refusal notice that replaces it, and records one event per
 * error shown. `error` resets to null between attempts, so a repeat on a later send counts again.
 */
export function useChatError( {
	error,
	isReaderChat,
	takeRefusalCode,
	refusalNotice,
}: UseChatErrorOptions ): ChatError {
	useEffect( () => {
		if ( error ) {
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_error', {
				error_type: getOrchestratorErrorType( error, takeRefusalCode() ),
			} );
		}
	}, [ error, takeRefusalCode ] );

	if ( error && refusalNotice ) {
		return { message: null, notice: refusalNotice };
	}

	return {
		message: isReaderChat
			? getReaderChatErrorMessage( error )
			: getOrchestratorErrorMessage( error ),
	};
}
