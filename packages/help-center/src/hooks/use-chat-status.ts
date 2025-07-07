import { isTestModeEnvironment, useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useSupportActivity } from '../data/use-support-activity';
import { useSupportStatus } from '../data/use-support-status';

export default function useChatStatus() {
	const { data: supportStatus } = useSupportStatus();
	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging();
	const availability = supportStatus?.availability;

	// All paying customers are eligible for chat.
	// They're only eligible if they can connect to Zendesk.
	// See: pdDR7T-1vN-p2
	const isEligibleForChat = Boolean(
		supportStatus?.eligibility?.is_user_eligible && canConnectToZendesk
	);

	const { data: supportActivity, isInitialLoading: isLoadingSupportActivity } =
		useSupportActivity( isEligibleForChat );
	const hasActiveChats = Boolean(
		supportActivity?.some( ( ticket ) => ticket.channel === 'Messaging' )
	);

	const forceEmailSupport =
		supportStatus?.availability?.force_email_support ||
		( isTestModeEnvironment() && supportStatus?.availability?.force_email_support_test );

	return {
		hasActiveChats,
		isEligibleForChat,
		isLoading: isLoadingSupportActivity,
		isPresalesChatOpen: Boolean( availability?.is_presales_chat_open ),
		isPrecancellationChatOpen: Boolean( availability?.is_precancellation_chat_open ),
		supportActivity,
		supportLevel: supportStatus?.eligibility?.support_level,
		forceEmailSupport,
	};
}
