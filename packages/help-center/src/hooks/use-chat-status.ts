/**
 * External Dependencies
 */
import { useSupportActivity } from '../data/use-support-activity';
import { useSupportStatus } from '../data/use-support-status';
/**
 * Internal Dependencies
 */
import { useZendeskConfig, useMessagingAvailability } from './';
import type { MessagingGroup } from './use-messaging-availability';

export default function useChatStatus(
	group: MessagingGroup = 'wpcom_messaging',
	checkAgentAvailability = true
) {
	const { data: supportStatus } = useSupportStatus();
	const availability = supportStatus.availability;

	// All paying customers are eligible for chat.
	// See: pdDR7T-1vN-p2
	const isEligibleForChat = Boolean( supportStatus?.eligibility?.is_user_eligible );

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
		isPresalesChatOpen: Boolean( availability?.is_presales_chat_open ),
		isPrecancellationChatOpen: Boolean( availability?.is_precancellation_chat_open ),
		supportActivity,
		supportLevel: supportStatus?.eligibility?.support_level,
	};
}
