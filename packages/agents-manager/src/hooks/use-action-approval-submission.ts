import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { ActionApprovalCard } from '../components/action-approval-card';
import {
	canAnswerApproval,
	getApprovalDecisionData,
	getApprovalErrorUpdate,
	insertApprovalCardMessages,
	isAwaitingApproval,
	type ActionApproval,
	type ActionApprovalDecision,
} from '../utils/action-approvals';
import type { useActionApprovals } from './use-action-approvals';
import type { useChatComposer } from './use-chat-composer';
import type { AgentsManagerUIMessage } from '../utils/convert-tool-messages-to-components';
import type { ComponentType } from 'react';

type ActionApprovals = ReturnType< typeof useActionApprovals >;

interface Options {
	approvals: ActionApprovals[ 'approvals' ];
	updateApproval: ActionApprovals[ 'updateApproval' ];
	cancelAwaitingApprovals: ActionApprovals[ 'cancelAwaitingApprovals' ];
	submitContextMessage: ReturnType< typeof useChatComposer >[ 'submitContextMessage' ];
	isProcessing: boolean;
	streamGeneration: symbol;
}

/**
 * Sends the user's Allow or Decline for a held call and shows each held call
 * in the transcript: its card while it waits, then the status message that
 * replaces it. The card stands in for the English fallback text of the message
 * that asked for the approval, which is hidden. The answer is a normal
 * `message/stream` request whose only part of its own is an `approvalDecision`
 * data part, kept out of the transcript and of later turns' history; its
 * stream carries the call's real result, which `useActionApprovals` reads.
 * Any other send leaves the waiting card behind, and the server cancels it.
 *
 * A failed answer is shown on its card, so `isErrorOnCard` tells the chat to
 * hide the same error until the next turn starts, or the stream generation
 * changes. An error after the call's result arrived belongs to the rest of the
 * turn, so it leaves the answered card alone and the chat shows it. A card is answerable only
 * between turns: Agenttic drops a send made while another runs.
 */
export function useActionApprovalSubmission( {
	approvals,
	updateApproval,
	cancelAwaitingApprovals,
	submitContextMessage,
	isProcessing,
	streamGeneration,
}: Options ) {
	const [ errorOnCardGeneration, setErrorOnCardGeneration ] = useState< symbol >();
	const isErrorOnCard = errorOnCardGeneration === streamGeneration;
	const approvalsRef = useRef( approvals );
	approvalsRef.current = approvals;
	// Same-tick double clicks land before the card re-renders as sending.
	const answeringToolCallIdsRef = useRef( new Set< string >() );

	useEffect( () => {
		if ( ! isProcessing ) {
			return;
		}
		setErrorOnCardGeneration( undefined );
		// A turn that isn't an answer: text, a suggestion, or a send of the host's.
		if ( answeringToolCallIdsRef.current.size === 0 ) {
			cancelAwaitingApprovals();
		}
	}, [ isProcessing, cancelAwaitingApprovals ] );

	const decide = useCallback(
		async ( toolCallId: string, decision: ActionApprovalDecision ) => {
			const approval = approvalsRef.current.get( toolCallId );
			const answering = answeringToolCallIdsRef.current;
			if ( ! approval || ! canAnswerApproval( approval ) || answering.has( toolCallId ) ) {
				return;
			}

			answering.add( toolCallId );
			let isDispatched = false;
			try {
				await submitContextMessage(
					'',
					{ type: 'data', data: getApprovalDecisionData( approval.proposalId, decision ) },
					() => {
						isDispatched = true;
						updateApproval( toolCallId, { status: 'sending', message: undefined } );
					}
				);
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( '[AgentsManager] Error sending an approval decision:', error );
				if ( ! isAwaitingApproval( approvalsRef.current.get( toolCallId ) ?? approval ) ) {
					return;
				}
				updateApproval( toolCallId, ( current ) =>
					isAwaitingApproval( current ) ? getApprovalErrorUpdate( error ) : {}
				);
				setErrorOnCardGeneration( streamGeneration );
				return;
			} finally {
				answering.delete( toolCallId );
			}

			// A stopped turn, or one that never carried the call's result, leaves the card answerable.
			if ( isDispatched ) {
				updateApproval( toolCallId, ( current ) =>
					current.status === 'sending' ? { status: 'pending' } : {}
				);
			}
		},
		[ streamGeneration, submitContextMessage, updateApproval ]
	);

	const withActionApprovalCards = useCallback(
		( messages: AgentsManagerUIMessage[] ): AgentsManagerUIMessage[] => {
			const cards = Array.from( approvals.values() );
			const requestMessageIds = new Set( cards.map( ( approval ) => approval.messageId ) );

			return insertApprovalCardMessages(
				messages.filter( ( message ) => ! requestMessageIds.has( message.id ) ),
				cards.map( ( approval ) => createCardMessage( approval, isProcessing, decide ) )
			);
		},
		[ approvals, decide, isProcessing ]
	);

	return { withActionApprovalCards, isErrorOnCard };
}

function createCardMessage(
	approval: ActionApproval,
	isProcessing: boolean,
	decide: ( toolCallId: string, decision: ActionApprovalDecision ) => void
): AgentsManagerUIMessage {
	return {
		id: `action-approval-${ approval.toolCallId }`,
		role: 'agent',
		content: [
			{
				type: 'component',
				component: ActionApprovalCard as ComponentType,
				componentProps: {
					approval,
					isDisabled: isProcessing,
					onDecide: ( decision: ActionApprovalDecision ) => decide( approval.toolCallId, decision ),
				},
			},
		],
		timestamp: approval.timestamp,
		archived: false,
		showIcon: false,
	};
}
