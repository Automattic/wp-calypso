import { __, sprintf } from '@wordpress/i18n';
import { isRecord } from './is-record';
import type { TaskUpdate } from '@automattic/agenttic-client';

export type ActionApprovalDecision = 'allow' | 'decline';

export type ActionApprovalStatus =
	// Waiting for the user's answer: the card shows.
	| 'pending'
	| 'sending'
	| 'error'
	// Answered: a status message replaces the card.
	| 'done'
	| 'failed'
	| 'declined'
	| 'cancelled'
	| 'in-progress'
	| 'unknown'
	| 'unavailable';

export interface ActionApproval {
	toolCallId: string;
	toolId: string;
	proposalId: number;
	arguments: Record< string, unknown >;
	status: ActionApprovalStatus;
	/** Why it failed, for `failed` and `error`. */
	message?: string;
	/** When the call was held, which places the card in the transcript. */
	timestamp: number;
}

export interface ToolCallPart {
	toolCallId: string;
	toolId: string;
	arguments: Record< string, unknown >;
}

export interface ToolResultPart {
	toolCallId: string;
	toolId: string;
	result: unknown;
}

const AWAITING_USER_APPROVAL = 'awaiting_user_approval';
const DIGITS = /^\d+$/;

/**
 * The tool calls and results an update's agent message carries. The client's
 * own `user` message replays history, so it is skipped, as are token deltas,
 * whose arguments are still partial.
 */
export function getToolPartsFromTaskUpdate( update: TaskUpdate ): {
	calls: ToolCallPart[];
	results: ToolResultPart[];
} {
	const calls: ToolCallPart[] = [];
	const results: ToolResultPart[] = [];
	const message = update.status?.message;
	if ( update.kind === 'delta' || ! message || message.role === 'user' ) {
		return { calls, results };
	}

	for ( const part of message.parts ?? [] ) {
		const data: unknown = part.type === 'data' ? part.data : undefined;
		if ( ! isRecord( data ) ) {
			continue;
		}

		const { toolCallId, toolId } = data;
		if ( typeof toolCallId !== 'string' || typeof toolId !== 'string' ) {
			continue;
		}

		if ( 'result' in data ) {
			results.push( { toolCallId, toolId, result: data.result } );
		} else if ( isRecord( data.arguments ) ) {
			calls.push( { toolCallId, toolId, arguments: data.arguments } );
		}
	}

	return { calls, results };
}

/** The proposal a held call's result waits on, or `undefined` if the call wasn't held. */
export function getHeldProposalId( result: unknown ): number | undefined {
	if ( ! isRecord( result ) || result.status !== AWAITING_USER_APPROVAL ) {
		return undefined;
	}

	const { proposal_id: proposalId } = result;
	if ( typeof proposalId === 'number' && Number.isInteger( proposalId ) ) {
		return proposalId;
	}

	return typeof proposalId === 'string' && DIGITS.test( proposalId )
		? Number( proposalId )
		: undefined;
}

/** How a held call ended, from the result the server sends once it is answered. */
export function getApprovalOutcome(
	result: unknown
): Pick< ActionApproval, 'status' | 'message' > | undefined {
	if ( isRecord( result ) && result.status === AWAITING_USER_APPROVAL ) {
		return undefined;
	}

	const status = isRecord( result ) ? result.status : undefined;
	if ( status === 'failed' ) {
		const message = isRecord( result ) ? result.message : undefined;
		return { status: 'failed', ...( typeof message === 'string' && message && { message } ) };
	}
	if ( status === 'declined' ) {
		return { status: 'declined' };
	}
	if ( status === 'cancelled' ) {
		return { status: 'cancelled' };
	}

	return { status: 'done' };
}

const STORED_STATE_STATUS: Record< string, ActionApprovalStatus > = {
	approved: 'in-progress',
	executing: 'in-progress',
	succeeded: 'done',
	failed: 'failed',
	declined: 'declined',
	cancelled: 'cancelled',
	outcome_unknown: 'unknown',
};

/**
 * What a failed decision does to its card. The server's `error.data.code` says
 * why; an already answered card takes the stored state instead of an error.
 * A card the server no longer has, or one proposed for another site, stops being
 * answerable: any other error keeps it, for a retry.
 */
export function getApprovalErrorUpdate(
	error: unknown
): Pick< ActionApproval, 'status' | 'message' > {
	const data = isRecord( error ) && isRecord( error.data ) ? error.data : {};

	switch ( data.code ) {
		case 'approval_already_decided':
			return {
				status:
					( typeof data.state === 'string' && STORED_STATE_STATUS[ data.state ] ) || 'unknown',
			};
		case 'approval_not_found':
			return { status: 'unavailable' };
		case 'approval_site_mismatch':
			// Switching sites starts a new stream, which drops the card, so it can't be answered later either.
			return {
				status: 'unavailable',
				message: __(
					'This request was made on another site and can’t be answered here.',
					__i18n_text_domain__
				),
			};
	}

	return {
		status: 'error',
		message: __( 'Your answer couldn’t be sent. Please try again.', __i18n_text_domain__ ),
	};
}

/** The command that answers a held call: `/approve 123` or `/decline 123`. */
export function getApprovalCommand( proposalId: number, decision: ActionApprovalDecision ): string {
	return `/${ decision === 'allow' ? 'approve' : 'decline' } ${ proposalId }`;
}

/** Whether a call still waits for the user's answer, so its card shows instead of a status message. */
export function isAwaitingApproval( approval: ActionApproval ): boolean {
	return (
		approval.status === 'pending' || approval.status === 'sending' || approval.status === 'error'
	);
}

/** Whether the user can answer a card now: not while its answer is on the way. */
export function canAnswerApproval( approval: ActionApproval ): boolean {
	return approval.status === 'pending' || approval.status === 'error';
}

function capitalize( text: string ): string {
	return text.charAt( 0 ).toUpperCase() + text.slice( 1 );
}

/** The first plain argument other than `action`, which names what the action works on. */
function getKeyArgument( args: Record< string, unknown > ): string | undefined {
	for ( const [ name, value ] of Object.entries( args ) ) {
		if ( name === 'action' ) {
			continue;
		}
		if ( ( typeof value === 'string' && value.trim() ) || typeof value === 'number' ) {
			return String( value );
		}
	}

	return undefined;
}

/**
 * A readable name for the held action, from its tool id and arguments:
 * `wpcom__plugins` with `{ action: 'uninstall', plugin: 'hello-dolly' }` is
 * "Plugin uninstall (hello-dolly)". There is no summary from the server yet.
 */
export function getApprovalActionLabel(
	approval: Pick< ActionApproval, 'toolId' | 'arguments' >
): string {
	const toolName =
		approval.toolId.split( '__' ).pop()?.replace( /_/g, ' ' ).trim() || approval.toolId;
	const action = approval.arguments.action;
	const name =
		typeof action === 'string' && action.trim()
			? `${ toolName.replace( /([^su])s$/, '$1' ) } ${ action.replace( /_/g, ' ' ).trim() }`
			: toolName;
	const keyArgument = getKeyArgument( approval.arguments );

	return capitalize( keyArgument ? `${ name } (${ keyArgument })` : name );
}

/** The status message that replaces an answered card, or `undefined` while it waits for an answer. */
export function getApprovalStatusMessage( approval: ActionApproval ): string | undefined {
	const label = getApprovalActionLabel( approval );

	switch ( approval.status ) {
		case 'done':
			/* translators: %s: the approved action, e.g. "Plugin uninstall (hello-dolly)". */
			return sprintf( __( 'Approved: %s. Done.', __i18n_text_domain__ ), label );
		case 'failed':
			return approval.message
				? sprintf(
						/* translators: 1: the approved action, e.g. "Plugin uninstall (hello-dolly)". 2: why it failed, as the server reported it. */
						__( 'Approved: %1$s. Failed: %2$s', __i18n_text_domain__ ),
						label,
						approval.message
					)
				: /* translators: %s: the approved action, e.g. "Plugin uninstall (hello-dolly)". */
					sprintf( __( 'Approved: %s. Failed.', __i18n_text_domain__ ), label );
		case 'declined':
			/* translators: %s: the declined action, e.g. "Plugin uninstall (hello-dolly)". */
			return sprintf( __( 'Declined: %s.', __i18n_text_domain__ ), label );
		case 'cancelled':
			/* translators: %s: the action that didn't run, e.g. "Plugin uninstall (hello-dolly)". */
			return sprintf( __( 'Not performed: %s.', __i18n_text_domain__ ), label );
		case 'in-progress':
			/* translators: %s: the approved action, e.g. "Plugin uninstall (hello-dolly)". */
			return sprintf( __( 'Approved: %s. In progress.', __i18n_text_domain__ ), label );
		case 'unknown':
			/* translators: %s: the approved action, e.g. "Plugin uninstall (hello-dolly)". */
			return sprintf( __( 'Approved: %s. Result unknown.', __i18n_text_domain__ ), label );
		case 'unavailable':
			return approval.message ?? __( 'This request is no longer available.', __i18n_text_domain__ );
		default:
			return undefined;
	}
}

/** An argument value as plain text. */
export function formatApprovalArgument( value: unknown ): string {
	if ( typeof value === 'string' ) {
		return value;
	}

	return JSON.stringify( value ) ?? String( value );
}

/**
 * Places each card before the first message that came after its call was held,
 * keeping the transcript's own order.
 */
export function insertApprovalCardMessages< T extends { timestamp: number } >(
	messages: T[],
	cardMessages: T[]
): T[] {
	if ( cardMessages.length === 0 ) {
		return messages;
	}

	const remainingCards = [ ...cardMessages ].sort( ( a, b ) => a.timestamp - b.timestamp );
	const result: T[] = [];
	for ( const message of messages ) {
		while ( remainingCards.length > 0 && remainingCards[ 0 ].timestamp < message.timestamp ) {
			result.push( remainingCards.shift()! );
		}
		result.push( message );
	}

	return [ ...result, ...remainingCards ];
}
