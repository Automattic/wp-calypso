/**
 * External Dependencies
 */
import { useSupportActivity } from '../data/use-support-activity';
/**
 * Internal Dependencies
 */
import { useZendeskConfig, useMessagingAvailability } from './';
import type { MessagingGroup } from './use-messaging-availability';

export default function useChatStatus(
	group: MessagingGroup = 'wpcom_messaging',
	checkAgentAvailability = true
) {
	const { data: supportActivity, isInitialLoading: isLoadingSupportActivity } =
		useSupportActivity();

	const hasActiveChats = Boolean(
		supportActivity?.some( ( ticket ) => ticket.channel === 'Messaging' )
	);

	const { data: chatAvailability, isInitialLoading: isLoadingAvailability } =
		useMessagingAvailability( group, checkAgentAvailability );

	const { status: zendeskStatus } = useZendeskConfig( true );

	return {
		canConnectToZendesk: zendeskStatus !== 'error',
		hasActiveChats,
		isChatAvailable: Boolean( chatAvailability?.is_available ),
		isLoading: isLoadingAvailability || isLoadingSupportActivity,
		supportActivity,
		wapuuAssistantEnabled: true, // TODO: Check if this should be always true
	};
}
