import { getApprovalRequest } from '@automattic/agenttic-client';
import type { ApprovalRequest, Message } from '@automattic/agenttic-client';
import type { ApprovalCardProps, ApprovalCardState } from '@automattic/agenttic-ui';

export interface ActionApprovalRecord {
	id: string;
	request: ApprovalRequest;
}

export function upsertActionApprovals(
	records: Map< string, ActionApprovalRecord >,
	messages: Message[]
): Map< string, ActionApprovalRecord > {
	const next = new Map( records );
	for ( const message of messages ) {
		for ( const part of message.parts ) {
			const request = getApprovalRequest( part );
			if ( ! request ) {
				continue;
			}
			const id = `approval:${ request.proposalId }`;
			const previous = next.get( id );
			if ( previous && previous.request.state !== 'pending' && request.state === 'pending' ) {
				continue;
			}
			next.set( id, { id, request } );
		}
	}
	return next;
}

export function isPendingApproval( record: ActionApprovalRecord ): boolean {
	return record.request.state === 'pending';
}

export function getApprovalCardProps(
	{ request }: ActionApprovalRecord,
	onDecision: ApprovalCardProps[ 'onDecision' ],
	isSending = false
): ApprovalCardProps {
	const states: Record< ApprovalRequest[ 'state' ], ApprovalCardState > = {
		pending: 'pending',
		approved: 'outcome_unknown',
		executing: 'outcome_unknown',
		succeeded: 'done',
		declined: 'declined',
		cancelled: 'cancelled',
		failed: 'failed',
		outcome_unknown: 'outcome_unknown',
	};
	return {
		proposalId: request.proposalId,
		description: request.description,
		notice: request.notice,
		allowForChat: request.allowForChat,
		state: isSending ? 'sending' : states[ request.state ],
		onDecision,
	};
}
