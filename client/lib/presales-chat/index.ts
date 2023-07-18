import { useMessagingAvailability, useZendeskMessaging } from '@automattic/help-center/src/hooks';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { ZendeskConfigName } from '@automattic/help-center/src/hooks/use-zendesk-messaging';

export type KeyType = 'akismet' | 'jpAgency' | 'jpCheckout' | 'jpGeneral' | 'wpcom';

function getConfigName( keyType: KeyType ): ZendeskConfigName {
	switch ( keyType ) {
		case 'akismet':
			return 'zendesk_presales_chat_key_akismet';
		case 'jpAgency':
			return 'zendesk_presales_chat_key_jp_agency_dashboard';
		case 'jpCheckout':
			return 'zendesk_presales_chat_key_jp_checkout';
		case 'jpGeneral':
		case 'wpcom':
		default:
			return 'zendesk_presales_chat_key';
	}
}

function getGroupName( keyType: KeyType ) {
	switch ( keyType ) {
		case 'akismet':
		case 'jpAgency':
		case 'jpCheckout':
		case 'jpGeneral':
			return 'jp_presales';
		case 'wpcom':
		default:
			return 'wpcom_presales';
	}
}

export function usePresalesChat( keyType: KeyType, enabled = true, skipAvailabilityCheck = false ) {
	const isEnglishLocale = useIsEnglishLocale();
	const isEligibleForPresalesChat = enabled && isEnglishLocale;

	const group = getGroupName( keyType );

	//some types of chat should always show the widget, even if the chat is not available
	const { data: chatAvailability, isInitialLoading: isLoadingAvailability } =
		useMessagingAvailability( group, isEligibleForPresalesChat && ! skipAvailabilityCheck );

	const isPresalesChatAvailable =
		skipAvailabilityCheck || Boolean( chatAvailability?.is_available );

	const isLoggedIn = useSelector( isUserLoggedIn );
	const zendeskKeyName = getConfigName( keyType );
	useZendeskMessaging(
		zendeskKeyName,
		isEligibleForPresalesChat && isPresalesChatAvailable,
		isLoggedIn
	);

	return {
		isChatActive: isPresalesChatAvailable && isEligibleForPresalesChat,
		isLoading: isLoadingAvailability,
		isPresalesChatAvailable,
	};
}
