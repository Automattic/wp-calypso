import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { ODIE_DEFAULT_BOT_SLUG_LEGACY } from '../constants';
import { useOdieAssistantContext } from '../context';
import { generateUUID } from '../utils';
import { useCurrentSupportInteraction } from './use-current-support-interaction';
import type { Message } from '../types';

/** How long after a failed decision request to reload once more for a late continuation. */
const CONTINUATION_RELOAD_DELAY_MS = 20000;

/**
 * Give up waiting for the decision response after this long. The request carries a whole bot turn
 * (execute + model calls) so it is legitimately slow, but the error path (reload from the server)
 * only works if the promise settles — wpcom-proxy-request has no timeout of its own.
 */
const DECISION_TIMEOUT_MS = 90000;

const withTimeout = < T >( promise: Promise< T >, ms: number ): Promise< T > =>
	Promise.race( [
		promise,
		new Promise< never >( ( _, reject ) =>
			window.setTimeout( () => reject( new Error( 'approval-decision-timeout' ) ), ms )
		),
	] );

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
	 * When the turn could not be resumed the server stores and returns a plain outcome message
	 * instead, so this is null only when the proposal was not found in the chat.
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
			return withTimeout(
				wpcomRequest< ApprovalDecisionResponse >( {
					method: 'POST',
					path: `/ai/action-approvals/${ token }/${ decision }`,
					apiNamespace: 'wpcom/v2',
					body: { chat_id: chat.odieId, bot_id: botSlug },
				} ),
				DECISION_TIMEOUT_MS
			);
		},
		// The decision runs the bot's next turn server-side (execute, then a model call), so show
		// the same "thinking" placeholder a live reply shows until the continuation arrives.
		onMutate: () => {
			setChatStatus( 'sending' );
		},
		// A failed request does not mean a failed decision: the token is consumed before the action
		// runs, and the request can die while the server is still generating the continuation. So
		// never re-offer the buttons on our own judgement — reload the chat from the server, which
		// now records the truth on the card itself (approval.status) and in the stored outcome or
		// continuation message. Setting the chat to `loading` is what makes the LIVE view adopt the
		// refetched chat (useGetCombinedChat ignores refetches otherwise).
		onError: () => {
			const reload = () => {
				setChatStatus( 'loading' );
				queryClient.invalidateQueries( { queryKey: [ 'odie-chat', botSlug, chat.odieId ] } );
			};
			reload();
			// The usual reason for the error is a timeout while the server is still writing the bot's
			// continuation; the first reload shows the decided card, this one picks up the reply.
			window.setTimeout( reload, CONTINUATION_RELOAD_DELAY_MS );
		},
		onSuccess: ( response ) => {
			setChatStatus( 'loaded' );
			const continuation = response?.continuation;
			if ( continuation ) {
				addMessage( {
					message_id: continuation.message_id,
					internal_message_id: generateUUID(),
					content: continuation.content ?? '',
					role: 'bot',
					type: 'message',
					context: continuation.context,
				} );
			}
			// The card's own message was marked decided server-side; the refetch picks that up.
			queryClient.invalidateQueries( { queryKey: [ 'odie-chat', botSlug, chat.odieId ] } );
		},
	} );
};
