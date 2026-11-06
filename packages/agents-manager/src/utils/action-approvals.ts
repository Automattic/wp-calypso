import { __, sprintf } from '@wordpress/i18n';
import { isRecord } from './is-record';
import type { TaskUpdate } from '@automattic/agenttic-client';

export type ActionApprovalDecision = 'allow' | 'decline';

/** `execute` for a server ability; `dispatch` for a client tool, which the server sends back to run once allowed. */
export type ActionApprovalOrigin = 'execute' | 'dispatch';

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
	/** The action's name, from the server. */
	label?: string;
	arguments: Record< string, unknown >;
	origin: ActionApprovalOrigin;
	/** The agent message that asked for the approval, whose fallback text the card replaces. */
	messageId?: string;
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

const DIGITS = /^\d+$/;

function getProposalId( value: unknown ): number | undefined {
	if ( typeof value === 'number' && Number.isInteger( value ) && value > 0 ) {
		return value;
	}

	return typeof value === 'string' && DIGITS.test( value ) ? Number( value ) : undefined;
}

/**
 * The call a held turn asks the user to approve: the `approvalRequest` data
 * part of its final `auth-required` message. The request isn't a call part, so
 * nothing runs it: a `dispatch` call runs only once the server sends it back.
 */
export function getApprovalRequestFromTaskUpdate(
	update: TaskUpdate
): Omit< ActionApproval, 'status' | 'timestamp' > | undefined {
	const message = update.status?.message;
	if ( update.status?.state !== 'auth-required' || message?.role !== 'agent' ) {
		return undefined;
	}

	for ( const part of message.parts ?? [] ) {
		const data: unknown = part.type === 'data' ? part.data : undefined;
		const request = isRecord( data ) ? data.approvalRequest : undefined;
		if ( ! isRecord( request ) ) {
			continue;
		}

		const proposalId = getProposalId( request.proposalId );
		const { toolCallId, toolId, label, origin } = request;
		if (
			proposalId === undefined ||
			typeof toolCallId !== 'string' ||
			! toolCallId ||
			typeof toolId !== 'string' ||
			! toolId
		) {
			continue;
		}

		return {
			toolCallId,
			toolId,
			proposalId,
			...( typeof label === 'string' && label.trim() && { label: label.trim() } ),
			arguments: isRecord( request.arguments ) ? request.arguments : {},
			origin: origin === 'dispatch' ? 'dispatch' : 'execute',
			messageId: message.messageId,
		};
	}

	return undefined;
}

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

/**
 * The calls whose results the client sends back to the agent, after it ran
 * them for an `input-required` update: its `working` message replays them with
 * the history.
 */
export function getSentToolResultIds( update: TaskUpdate ): string[] {
	const message = update.status?.message;
	if ( update.kind === 'delta' || update.status?.state !== 'working' || message?.role !== 'user' ) {
		return [];
	}

	return ( message.parts ?? [] ).flatMap( ( part ) => {
		const data: unknown = part.type === 'data' ? part.data : undefined;
		return isRecord( data ) && 'result' in data && typeof data.toolCallId === 'string'
			? [ data.toolCallId ]
			: [];
	} );
}

/** How a held call ended, from the result the server sends once it is answered. */
export function getApprovalOutcome(
	result: unknown
): Pick< ActionApproval, 'status' | 'message' > {
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
	dispatched: 'in-progress',
	succeeded: 'done',
	failed: 'failed',
	declined: 'declined',
	cancelled: 'cancelled',
	outcome_unknown: 'unknown',
};

/**
 * What a failed decision does to its card. An error with the server's own
 * approval code (`error.data.code`) means the card can't be answered any more:
 * an already answered card takes the stored state. Any other error, such as a
 * lost connection, keeps it, for a retry; a retry after an answer that did land
 * gets the stored state.
 */
export function getApprovalErrorUpdate(
	error: unknown
): Pick< ActionApproval, 'status' | 'message' > {
	const data = isRecord( error ) && isRecord( error.data ) ? error.data : {};
	const code = typeof data.code === 'string' ? data.code : '';

	if ( code === 'approval_already_decided' ) {
		return {
			status:
				( typeof data.state === 'string' && STORED_STATE_STATUS[ data.state ] ) || 'unavailable',
		};
	}
	if ( code === 'approval_site_mismatch' ) {
		return {
			status: 'unavailable',
			message: __(
				'This request was made on another site and can’t be answered here.',
				__i18n_text_domain__
			),
		};
	}
	if ( code.startsWith( 'approval_' ) || code === 'invalid_approval_decision' ) {
		return { status: 'unavailable' };
	}

	return {
		status: 'error',
		message: __( 'Your answer couldn’t be sent. Please try again.', __i18n_text_domain__ ),
	};
}

/** The data part that answers a held call. */
export function getApprovalDecisionData(
	proposalId: number,
	decision: ActionApprovalDecision
): Record< string, unknown > {
	return { approvalDecision: { proposalId, decision } };
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
 * A readable name for the held action: the server's label, or else one from
 * its tool id and arguments: `wpcom__plugins` with
 * `{ action: 'uninstall', plugin: 'hello-dolly' }` is "Plugin uninstall (hello-dolly)".
 */
export function getApprovalActionLabel(
	approval: Pick< ActionApproval, 'toolId' | 'arguments' | 'label' >
): string {
	if ( approval.label ) {
		return approval.label;
	}

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
