import { useCallback, useRef, useState } from '@wordpress/element';
import {
	getApprovalOutcome,
	getHeldProposalId,
	getHeldToolCall,
	getSentToolResultIds,
	getToolPartsFromTaskUpdate,
	isAwaitingApproval,
	type ActionApproval,
	type ActionApprovalStatus,
	type ToolCallPart,
} from '../utils/action-approvals';
import type { TaskUpdate } from '@automattic/agenttic-client';

interface ApprovalsState {
	streamGeneration: symbol;
	byToolCallId: ReadonlyMap< string, ActionApproval >;
}

const NO_APPROVALS: ReadonlyMap< string, ActionApproval > = new Map();

type ApprovalPatch =
	Partial< ActionApproval > | ( ( approval: ActionApproval ) => Partial< ActionApproval > );

/**
 * Action approvals: the ability calls WordPress Agent holds until the user
 * answers them in the chat. Only the stream says a call is held (a reloaded
 * chat has no tool messages), so the held calls and how they end are read from
 * task updates: the held call's result, the result its answer streams back,
 * and the "cancelled" result a new message streams for each unanswered card.
 * A held client tool's Allow streams no result: the server hands the call back
 * as `input-required` under the same id, and the client runs it, so its card is
 * in progress until the client sends the result back.
 *
 * At most one card waits at a time: the server ends the turn at a held call, so
 * a newer held call means an earlier one was left behind, and it shows as not
 * performed. `isAwaitingApproval` says one is waiting, so the chat can hide its
 * composer and leave Allow and Decline as the only way forward.
 *
 * Kept per stream generation, so a session switch starts with no cards and a
 * new chat's bootstrap keeps them.
 */
export function useActionApprovals( streamGeneration: symbol ) {
	const [ state, setState ] = useState< ApprovalsState >( {
		streamGeneration,
		byToolCallId: NO_APPROVALS,
	} );
	const streamGenerationRef = useRef( streamGeneration );
	streamGenerationRef.current = streamGeneration;
	// A held call's arguments arrive on its call part, before its result.
	const toolCallsRef = useRef( new Map< string, ToolCallPart >() );

	const approvals = state.streamGeneration === streamGeneration ? state.byToolCallId : NO_APPROVALS;

	const updateApprovals = useCallback(
		(
			update: (
				approvals: Map< string, ActionApproval >
			) => Map< string, ActionApproval > | undefined
		) => {
			setState( ( previous ) => {
				const generation = streamGenerationRef.current;
				const current =
					previous.streamGeneration === generation ? previous.byToolCallId : NO_APPROVALS;
				const next = update( new Map( current ) );

				return next ? { streamGeneration: generation, byToolCallId: next } : previous;
			} );
		},
		[]
	);

	const setApprovalStatuses = useCallback(
		( toolCallIds: string[], from: ActionApprovalStatus, to: ActionApprovalStatus ) => {
			updateApprovals( ( byToolCallId ) => {
				let hasChanged = false;
				for ( const toolCallId of toolCallIds ) {
					const approval = byToolCallId.get( toolCallId );
					if ( approval?.status === from ) {
						byToolCallId.set( toolCallId, { ...approval, status: to, message: undefined } );
						hasChanged = true;
					}
				}

				return hasChanged ? byToolCallId : undefined;
			} );
		},
		[ updateApprovals ]
	);

	// The caller drops updates from an earlier stream generation.
	const recordApprovalUpdate = useCallback(
		( update: TaskUpdate ) => {
			const { calls, results } = getToolPartsFromTaskUpdate( update );
			if ( update.status?.state === 'input-required' ) {
				setApprovalStatuses(
					calls.map( ( { toolCallId } ) => toolCallId ),
					'sending',
					'in-progress'
				);
				return;
			}
			const sentToolResultIds = getSentToolResultIds( update );
			if ( sentToolResultIds.length > 0 ) {
				setApprovalStatuses( sentToolResultIds, 'in-progress', 'done' );
				return;
			}

			calls.forEach( ( call ) => toolCallsRef.current.set( call.toolCallId, call ) );
			if ( results.length === 0 ) {
				return;
			}
			const callArguments = new Map(
				results.map( ( { toolCallId } ) => [
					toolCallId,
					toolCallsRef.current.get( toolCallId )?.arguments,
				] )
			);
			results.forEach( ( { toolCallId } ) => toolCallsRef.current.delete( toolCallId ) );

			updateApprovals( ( byToolCallId ) => {
				let hasChanged = false;

				for ( const { toolCallId, toolId, result } of results ) {
					const approval = byToolCallId.get( toolCallId );
					const proposalId = getHeldProposalId( result );

					if ( proposalId !== undefined && ! approval ) {
						const heldToolCall = getHeldToolCall( result );
						byToolCallId.forEach( ( earlier, earlierToolCallId ) => {
							if ( isAwaitingApproval( earlier ) ) {
								byToolCallId.set( earlierToolCallId, { ...earlier, status: 'cancelled' } );
							}
						} );
						byToolCallId.set( toolCallId, {
							toolCallId,
							toolId: heldToolCall.toolId ?? toolId,
							proposalId,
							arguments: callArguments.get( toolCallId ) ?? heldToolCall.arguments ?? {},
							status: 'pending',
							timestamp: Date.now(),
						} );
						hasChanged = true;
						continue;
					}

					const outcome = approval && getApprovalOutcome( result );
					if ( approval && outcome ) {
						byToolCallId.set( toolCallId, {
							...approval,
							status: outcome.status,
							message: outcome.message,
						} );
						hasChanged = true;
					}
				}

				return hasChanged ? byToolCallId : undefined;
			} );
		},
		[ setApprovalStatuses, updateApprovals ]
	);

	const updateApproval = useCallback(
		( toolCallId: string, patch: ApprovalPatch ) => {
			updateApprovals( ( byToolCallId ) => {
				const approval = byToolCallId.get( toolCallId );
				if ( ! approval ) {
					return undefined;
				}

				const changes = typeof patch === 'function' ? patch( approval ) : patch;
				byToolCallId.set( toolCallId, { ...approval, ...changes } );
				return byToolCallId;
			} );
		},
		[ updateApprovals ]
	);

	const isAwaitingApprovalAnswer = Array.from( approvals.values() ).some( isAwaitingApproval );

	return { approvals, isAwaitingApprovalAnswer, recordApprovalUpdate, updateApproval };
}
