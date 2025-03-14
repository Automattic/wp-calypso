import { useIsEnglishLocale } from '@automattic/i18n-utils';
import {
	useZendeskMessagingAvailability,
	useLoadZendeskMessaging,
	useCanConnectToZendeskMessaging,
	ZENDESK_SOURCE_URL_TICKET_FIELD_ID,
} from '@automattic/zendesk-client';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { ZendeskConfigName } from '@automattic/zendesk-client';

export type KeyType = 'akismet' | 'jpAgency' | 'jpCheckout' | 'jpGeneral' | 'wpcom';

declare global {
	interface Window {
		zE: (
			action: string,
			value: string,
			handler?:
				| ( ( callback: ( data: string | number ) => void ) => void )
				| { id: number; value: string }[]
		) => void;
	}
}

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
	const isWpMobileAppUser = isWpMobileApp();
	const group = getGroupName( keyType );

	const { data: canConnectToZendeskMessaging } = useCanConnectToZendeskMessaging(
		enabled && ! skipAvailabilityCheck
	);
	const isEligibleForPresalesChat =
		enabled && isEnglishLocale && canConnectToZendeskMessaging && ! isWpMobileAppUser;

	const { data: chatAvailability, isLoading: isLoadingAvailability } =
		useZendeskMessagingAvailability( group, isEligibleForPresalesChat && ! skipAvailabilityCheck );

	const isPresalesChatAvailable =
		skipAvailabilityCheck || Boolean( chatAvailability?.is_available );

	const isLoggedIn = useSelector( isUserLoggedIn );
	const zendeskKeyName = getConfigName( keyType );
	const { isMessagingScriptLoaded } = useLoadZendeskMessaging(
		isEligibleForPresalesChat && isPresalesChatAvailable,
		isLoggedIn,
		zendeskKeyName
	);

	const openChat = () => {
		window.zE( 'messenger', 'open' );
	};

	useEffect( () => {
		// presales chat is always shown by default
		if ( enabled && isPresalesChatAvailable && isMessagingScriptLoaded ) {
			window.zE( 'messenger', 'show' );
			window.zE( 'messenger:set', 'conversationFields', [
				{ id: ZENDESK_SOURCE_URL_TICKET_FIELD_ID, value: window.location.href },
			] );
		}
	}, [ enabled, isMessagingScriptLoaded, isPresalesChatAvailable ] );

	return {
		isChatActive: isPresalesChatAvailable && isEligibleForPresalesChat,
		isLoading: isLoadingAvailability,
		isPresalesChatAvailable,
		openChat,
	};
}
