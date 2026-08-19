import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { ODIE_DEFAULT_BOT_SLUG_LEGACY } from '../constants';
import { useOdieAssistantContext } from '../context';
import { useCurrentSupportInteraction } from './use-current-support-interaction';

/**
 * Approve or decline a pending write-approval proposal.
 *
 * The chat reference (chat_id + bot_id) rides on the request so the server appends the
 * decided outcome to this chat as a bot message; on success the chat query is
 * invalidated, the refetch renders that outcome message, and the pending approval card
 * (which only shows on the last message) disappears with it.
 * @returns useMutation return object.
 */
export const useSendApprovalDecision = () => {
	const { chat } = useOdieAssistantContext();
	const { data: supportInteraction } = useCurrentSupportInteraction();
	const queryClient = useQueryClient();

	const botSlug = supportInteraction?.bot_slug || ODIE_DEFAULT_BOT_SLUG_LEGACY;

	return useMutation( {
		mutationFn: ( { token, decision }: { token: string; decision: 'approve' | 'decline' } ) => {
			return wpcomRequest( {
				method: 'POST',
				path: `/ai/write-approvals/${ token }/${ decision }`,
				apiNamespace: 'wpcom/v2',
				body: { chat_id: chat.odieId, bot_id: botSlug },
			} );
		},
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'odie-chat', botSlug, chat.odieId ] } );
		},
	} );
};
