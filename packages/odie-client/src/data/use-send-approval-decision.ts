import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { ODIE_DEFAULT_BOT_SLUG_LEGACY } from '../constants';
import { useOdieAssistantContext } from '../context';
import { generateUUID } from '../utils';
import { useCurrentSupportInteraction } from './use-current-support-interaction';
import type { Message } from '../types';

type ApprovalDecisionResponse = {
	/** `failed`: the approval was recorded but the action did not run (see `error`). */
	status: 'executed' | 'declined' | 'failed';
	action?: string;
	description?: string;
	reason?: string;
	error?: string;
	/**
	 * The bot's next message: the server resumes the paused chat turn with the decision as the
	 * tool call's result, and this is what the bot said next (possibly another approval request).
	 * Null when the turn could not be resumed; the decision itself still stands.
	 */
	continuation?: {
		message_id?: number;
		content?: string;
		context?: Message[ 'context' ];
	} | null;
};

/**
 * Approve or decline a pending action-approval proposal.
 *
 * The chat reference (chat_id + bot_id) rides on the request so the server resumes the paused
 * turn and returns the bot's continuation, already stored in the chat. The LIVE view deliberately
 * ignores refetches of an unchanged interaction (it protects optimistic local messages — see
 * useGetCombinedChat), so the continuation is appended locally via addMessage, the same way live
 * bot replies land; the pending approval card (which only shows on the last message) retires with
 * it, and a continuation that is itself a new approval request renders as the next card. The
 * query invalidation keeps the cache fresh for the next mount, where the server-stored copy is
 * what loads.
 * @returns useMutation return object.
 */
export const useSendApprovalDecision = () => {
	const { chat, addMessage, setChatStatus } = useOdieAssistantContext();
	const { data: supportInteraction } = useCurrentSupportInteraction();
	const queryClient = useQueryClient();

	const botSlug = supportInteraction?.bot_slug || ODIE_DEFAULT_BOT_SLUG_LEGACY;

	return useMutation( {
		mutationFn: ( { token, decision }: { token: string; decision: 'approve' | 'decline' } ) => {
			return wpcomRequest< ApprovalDecisionResponse >( {
				method: 'POST',
				path: `/ai/action-approvals/${ token }/${ decision }`,
				apiNamespace: 'wpcom/v2',
				body: { chat_id: chat.odieId, bot_id: botSlug },
			} );
		},
		// The decision runs the bot's next turn server-side (execute, then a model call), so show
		// the same "thinking" placeholder a live reply shows until the continuation arrives.
		onMutate: () => {
			setChatStatus( 'sending' );
		},
		onSettled: () => {
			setChatStatus( 'loaded' );
		},
		onSuccess: ( response, { decision } ) => {
			const failed = 'failed' === response?.status;
			const executed = 'approve' === decision && ! failed;
			const description = response?.description ?? '';
			const continuation = response?.continuation;

			let fallbackStatus: 'executed' | 'declined' | 'failed' = 'declined';
			let fallbackContent = `You declined this action — it has not been performed: ${ description }`;
			if ( failed ) {
				fallbackStatus = 'failed';
				fallbackContent = `You approved this action, but it could not be completed: ${ description }`;
			} else if ( executed ) {
				fallbackStatus = 'executed';
				fallbackContent = `Done — you approved this action and it has been completed: ${ description }`;
			}

			const outcome: Message = continuation
				? {
						message_id: continuation.message_id,
						internal_message_id: generateUUID(),
						content: continuation.content ?? '',
						role: 'bot',
						type: 'message',
						context: continuation.context,
				  }
				: {
						// The server recorded the decision but could not resume the turn (pause
						// expired, bot updated). Say what happened; the next message starts fresh.
						content: fallbackContent,
						role: 'bot',
						type: 'message',
						internal_message_id: generateUUID(),
						context: {
							site_id: null,
							flags: executed
								? { wpcom_approval_executed: true }
								: { wpcom_approval_declined: true },
							approval: {
								status: fallbackStatus,
								action: response?.action,
								description,
							},
						},
				  };
			addMessage( outcome );
			queryClient.invalidateQueries( { queryKey: [ 'odie-chat', botSlug, chat.odieId ] } );
		},
	} );
};
