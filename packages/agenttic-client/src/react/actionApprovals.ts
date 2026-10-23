import { generateMessageId } from '../client/utils/core';
import type { Message, Part } from '../client/types/index';

export interface ApprovalRequest {
	version: 1;
	proposalId: string;
	chatId: number;
	consumer: 'wp-agent';
	origin: 'execute';
	state:
		| 'pending'
		| 'approved'
		| 'executing'
		| 'succeeded'
		| 'failed'
		| 'outcome_unknown'
		| 'declined'
		| 'cancelled';
	ability: string;
	description: string;
	notice: string;
	allowForChat: boolean;
}

export function parseApprovalRequest( value: unknown ): ApprovalRequest | null {
	if ( ! value || typeof value !== 'object' ) {
		return null;
	}
	const request = value as Record< string, unknown >;
	if (
		request.version !== 1 ||
		request.consumer !== 'wp-agent' ||
		request.origin !== 'execute' ||
		typeof request.proposalId !== 'string' ||
		! request.proposalId ||
		typeof request.chatId !== 'number' ||
		! Number.isSafeInteger( request.chatId ) ||
		request.chatId <= 0 ||
		typeof request.ability !== 'string' ||
		typeof request.description !== 'string' ||
		typeof request.notice !== 'string' ||
		typeof request.allowForChat !== 'boolean' ||
		! [
			'pending',
			'approved',
			'executing',
			'succeeded',
			'failed',
			'outcome_unknown',
			'declined',
			'cancelled',
		].includes( String( request.state ) )
	) {
		return null;
	}
	return {
		version: 1,
		consumer: 'wp-agent',
		origin: 'execute',
		proposalId: request.proposalId,
		chatId: request.chatId,
		ability: request.ability,
		description: request.description,
		notice: request.notice,
		allowForChat: request.allowForChat,
		state: request.state as ApprovalRequest[ 'state' ],
	};
}

export function getApprovalRequest( part: Part ): ApprovalRequest | null {
	return part.type === 'data' && 'approvalRequest' in part.data
		? parseApprovalRequest( part.data.approvalRequest )
		: null;
}

export function hasApprovalRequest( message?: Message ): boolean {
	return !! message?.parts.some( ( part ) => getApprovalRequest( part ) );
}

/** Separate display-only approvals from prose and upsert them before rendering. */
export function normalizeApprovalMessages( messages: Message[] ): Message[] {
	const result: Message[] = [];
	const indices = new Map< string, number >();
	for ( const message of messages ) {
		const parts = message.parts.filter( ( part ) => ! getApprovalRequest( part ) );
		if ( parts.length ) {
			result.push( parts.length === message.parts.length ? message : { ...message, parts } );
		}
		for ( const part of message.parts ) {
			const request = getApprovalRequest( part );
			if ( ! request ) {
				continue;
			}
			const messageId = `approval:${ request.proposalId }`;
			const index = indices.get( messageId );
			const previous =
				index === undefined ? undefined : getApprovalRequest( result[ index ].parts[ 0 ] );
			// A stale pending echo must not reopen an already decided proposal.
			if ( previous && previous.state !== 'pending' && request.state === 'pending' ) {
				continue;
			}
			const approval: Message = {
				...message,
				messageId,
				parts: [ { type: 'data', data: { approvalRequest: request } } ],
			};
			if ( index === undefined ) {
				indices.set( messageId, result.length );
				result.push( approval );
			} else {
				result[ index ] = { ...approval, metadata: result[ index ].metadata };
			}
		}
	}
	return result;
}

export interface ApprovalResume {
	proposalId: string;
	chatId: number;
}

export function isApprovalResumeMessage( message: Message ): boolean {
	return message.parts.some( ( part ) => part.type === 'data' && 'approvalResume' in part.data );
}

export function createApprovalResumeMessage( resume: ApprovalResume ): Message {
	if ( ! resume.proposalId || ! Number.isSafeInteger( resume.chatId ) || resume.chatId <= 0 ) {
		throw new Error( 'Invalid approval resume' );
	}
	return {
		role: 'user',
		kind: 'message',
		messageId: generateMessageId(),
		parts: [
			{
				type: 'data',
				data: { approvalResume: { proposalId: resume.proposalId, chatId: resume.chatId } },
			},
		],
	};
}
