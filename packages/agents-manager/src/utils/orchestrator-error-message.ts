import { __ } from '@wordpress/i18n';
import { CREDITS_REFUSAL_PREFIX } from './credits-tracks';
import type { AgentErrorDetails } from '@automattic/agenttic-client';

type OrchestratorErrorType = 'credits' | 'usage_limit' | 'rate_limit' | 'other';

/**
 * `calypso_agents_manager_chat_error`'s `error_class`. `timeout` and `stream_incomplete` are also
 * recorded when the chat shows no error. `abort` is for completeness: a cancelled request shows
 * nothing and isn't recorded.
 */
export type OrchestratorErrorClass =
	| Exclude< OrchestratorErrorType, 'other' >
	| 'network'
	| 'timeout'
	| 'abort'
	| 'stream_incomplete'
	| '4xx'
	| '5xx'
	| 'agent_error'
	| 'other';

// A fetch's TypeError for a request that never got, or lost, its response: Chrome, Safari, Firefox.
const NETWORK_FAILURE_PATTERN =
	/failed to fetch|load failed|networkerror|network error|network connection was lost/i;

// Codes are server-side identifiers; anything else could be text and stays out of Tracks.
const SAFE_ERROR_CODE_PATTERN = /^[\w.-]{1,64}$/;

function isUsageLimitError( error: string ): boolean {
	return error === 'ai_editorial_review_over_limit' || /jetpack ai usage limit/i.test( error );
}

// Map orchestrator (Jetpack AI sidebar) errors whose server messages are not
// client-translated to a localized copy, mirroring reader-chat-error-message.
// Non-matching errors pass through unchanged.
export function getOrchestratorErrorMessage( error: string | null ): string | null {
	if ( ! error ) {
		return null;
	}

	if ( isUsageLimitError( error ) ) {
		return __(
			'You have reached your Jetpack AI usage limit. Upgrade your plan to continue.',
			__i18n_text_domain__
		);
	}

	return error;
}

/**
 * A coarse class for a chat error, safe to send to Tracks: the raw server
 * message can carry request details, so it is never sent itself. `code` is the
 * failed reply's refusal code, which names a site credits refusal.
 */
export function getOrchestratorErrorType( error: string, code?: string ): OrchestratorErrorType {
	if ( code?.startsWith( CREDITS_REFUSAL_PREFIX ) ) {
		return 'credits';
	}

	if ( isUsageLimitError( error ) ) {
		return 'usage_limit';
	}

	if ( /\b429\b|too many requests|rate limit/i.test( error ) ) {
		return 'rate_limit';
	}

	return 'other';
}

/**
 * A finer class than `getOrchestratorErrorType`, from the error's status and name. The message is
 * only read for the classes that type already finds, and for a fetch's TypeError.
 */
export function getOrchestratorErrorClass(
	error: string,
	details: AgentErrorDetails | null,
	code?: string
): OrchestratorErrorClass {
	const type = getOrchestratorErrorType( error, code );
	if ( type !== 'other' ) {
		return type;
	}

	const status = details?.status;
	if ( status === 429 ) {
		return 'rate_limit';
	}
	if ( status !== undefined && status >= 400 && status < 500 ) {
		return '4xx';
	}
	if ( status !== undefined && status >= 500 && status < 600 ) {
		return '5xx';
	}

	if ( details?.timedOut ) {
		return 'timeout';
	}

	switch ( details?.name ) {
		case 'AbortError':
			return 'abort';
		case 'StreamIncompleteError':
			return 'stream_incomplete';
		case 'TypeError':
			return NETWORK_FAILURE_PATTERN.test( error ) ? 'network' : 'other';
	}

	return details?.code !== undefined ? 'agent_error' : 'other';
}

/**
 * The error's code for Tracks: the refusal code, else the server's, when it reads as an identifier.
 */
export function getOrchestratorErrorCode(
	details: AgentErrorDetails | null,
	refusalCode?: string
): string | undefined {
	const code = refusalCode || details?.code;
	if ( code === undefined ) {
		return undefined;
	}

	const value = String( code );
	return SAFE_ERROR_CODE_PATTERN.test( value ) ? value : undefined;
}
