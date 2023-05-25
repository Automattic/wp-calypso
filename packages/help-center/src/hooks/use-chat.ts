/**
 * External Dependencies
 */
import config from '@automattic/calypso-config';
import { useSupportAvailability, useSupportActivity } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
/**
 * Internal Dependencies
 */
import { HELP_CENTER_STORE } from '../stores';
import { useMessagingAuth, useZendeskConfig, useMessagingAvailability } from './';
import type { HelpCenterSelect } from '@automattic/data-stores';

export default function useChat( checkAvailability = true, authOnlyWhenActiveChats = false ) {
	const { data: chatStatus } = useSupportAvailability( 'CHAT' );
	const isEligibleForChat = Boolean( chatStatus?.is_user_eligible );

	const { data: supportActivity, isInitialLoading: isLoadingSupportActivity } =
		useSupportActivity( isEligibleForChat );
	const hasActiveChats = Boolean(
		supportActivity?.some( ( ticket ) => ticket.channel === 'Messaging' )
	);

	const { isMessagingScriptLoaded } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			isMessagingScriptLoaded: helpCenterSelect.isMessagingScriptLoaded(),
		};
	}, [] );
	const zendeskKey: string = config( 'zendesk_support_chat_key' );
	const isAuthNeeded = authOnlyWhenActiveChats
		? isEligibleForChat && hasActiveChats
		: isEligibleForChat || hasActiveChats;
	const { data: authData } = useMessagingAuth(
		zendeskKey,
		Boolean( isMessagingScriptLoaded ) && isAuthNeeded
	);

	const { data: chatAvailability, isInitialLoading: isLoadingAvailability } =
		useMessagingAvailability( 'wpcom_messaging', checkAvailability && isEligibleForChat );

	const { status: zendeskStatus } = useZendeskConfig( isEligibleForChat && hasActiveChats );

	return {
		canConnectToZendesk: zendeskStatus !== 'error',
		isLoading: isLoadingAvailability || isLoadingSupportActivity,
		hasActiveChats,
		isChatAvailable: Boolean( chatAvailability?.is_available ),
		isChatClosed: Boolean( chatStatus?.is_chat_closed ),
		isEligibleForChat,
		isLoggedIn: authData?.isLoggedIn,
	};
}
