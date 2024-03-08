/**
 * External Dependencies
 */
import { useSupportActivity } from '../data/use-support-activity';
import { useSupportAvailability } from '../data/use-support-availability';
/**
 * Internal Dependencies
 */
import { useZendeskConfig, useMessagingAvailability } from './';
import type { MessagingGroup } from './use-messaging-availability';

export default function useChatStatus(
	group: MessagingGroup = 'wpcom_messaging',
	checkAgentAvailability = true
) {
	const { data: chatStatus } = useSupportAvailability( 'CHAT' );
	const isEligibleForChat = Boolean( chatStatus?.is_user_eligible );

	const { data: supportActivity, isInitialLoading: isLoadingSupportActivity } =
		useSupportActivity( isEligibleForChat );
	const hasActiveChats = Boolean(
		supportActivity?.some( ( ticket ) => ticket.channel === 'Messaging' )
	);

	const { data: chatAvailability, isInitialLoading: isLoadingAvailability } =
		useMessagingAvailability( group, checkAgentAvailability && isEligibleForChat );

	const { status: zendeskStatus } = useZendeskConfig( isEligibleForChat );

	return {
		canConnectToZendesk: zendeskStatus !== 'error',
		hasActiveChats,
		isChatAvailable: Boolean( chatAvailability?.is_available ),
		isEligibleForChat,
		isLoading: isLoadingAvailability || isLoadingSupportActivity,
		isPresalesChatOpen: Boolean( chatStatus?.is_presales_chat_open ),
		isPrecancellationChatOpen: Boolean( chatStatus?.is_precancellation_chat_open ),
		supportActivity,
		supportLevel: chatStatus?.supportLevel,
		wapuuAssistantEnabled: chatStatus?.wapuu_assistant_enabled,
	};
}
