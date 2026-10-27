import { useCallback, useEffect, useRef } from '@wordpress/element';
import {
	getOrchestratorErrorClass,
	getOrchestratorErrorCode,
	getOrchestratorErrorMessage,
	getOrchestratorErrorType,
} from '../utils/orchestrator-error-message';
import { getReaderChatErrorMessage } from '../utils/reader-chat-error-message';
import { recordAgentsManagerTracksEvent } from '../utils/tracks';
import type { UseCreditsResult } from './use-credits';
import type { AgentErrorDetails } from '@automattic/agenttic-client';
import type { NoticeConfig } from '@automattic/agenttic-ui';

interface UseChatErrorOptions {
	error: string | null;
	errorDetails: AgentErrorDetails | null;
	isReaderChat: boolean;
	takeRefusalCode: UseCreditsResult[ 'takeRefusalCode' ];
	refusalNotice: UseCreditsResult[ 'refusalNotice' ];
}

interface ChatError {
	message: string | null;
	/** Shown in the thread in place of `message`. */
	notice?: NoticeConfig;
	/** Records a failure the chat doesn't show, for `useAgentChat`'s `onSilentError`. */
	recordSilentError: ( details: AgentErrorDetails ) => void;
}

function recordChatError(
	error: string,
	errorDetails: AgentErrorDetails | null,
	refusalCode: string | undefined,
	isNavigating: boolean
) {
	const errorCode = getOrchestratorErrorCode( errorDetails, refusalCode );
	recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_error', {
		error_type: getOrchestratorErrorType( error, refusalCode ),
		error_class: getOrchestratorErrorClass( error, errorDetails, refusalCode ),
		...( errorDetails?.status !== undefined && { http_status: errorDetails.status } ),
		...( errorCode && { error_code: errorCode } ),
		navigating: isNavigating,
	} );
}

/**
 * Gets a chat error's text, or the refusal notice that replaces it, and records one event per
 * error shown. `error` resets to null between attempts, so a repeat on a later send counts again.
 * The event carries the error's class, status and code, never its text. A failure the chat
 * doesn't show is recorded through `recordSilentError`.
 */
export function useChatError( {
	error,
	errorDetails,
	isReaderChat,
	takeRefusalCode,
	refusalNotice,
}: UseChatErrorOptions ): ChatError {
	// An error after `pagehide` is most likely the page closing the stream, not the chat failing.
	const isNavigatingRef = useRef( false );
	useEffect( () => {
		const onPageHide = () => {
			isNavigatingRef.current = true;
		};
		// A page restored from the back/forward cache is back in use.
		const onPageShow = () => {
			isNavigatingRef.current = false;
		};
		window.addEventListener( 'pagehide', onPageHide );
		window.addEventListener( 'pageshow', onPageShow );
		return () => {
			window.removeEventListener( 'pagehide', onPageHide );
			window.removeEventListener( 'pageshow', onPageShow );
		};
	}, [] );

	useEffect( () => {
		if ( ! error ) {
			return;
		}

		recordChatError( error, errorDetails, takeRefusalCode(), isNavigatingRef.current );
	}, [ error, errorDetails, takeRefusalCode ] );

	// No refusal code: that belongs to a reply that failed and shows its error.
	const recordSilentError = useCallback( ( details: AgentErrorDetails ) => {
		recordChatError( '', details, undefined, isNavigatingRef.current );
	}, [] );

	if ( error && refusalNotice ) {
		return { message: null, notice: refusalNotice, recordSilentError };
	}

	return {
		recordSilentError,
		message: isReaderChat
			? getReaderChatErrorMessage( error )
			: getOrchestratorErrorMessage( error ),
	};
}
