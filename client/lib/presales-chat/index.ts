import {
	useChatStatus,
	useMessagingAvailability,
	useZendeskMessaging,
} from '@automattic/help-center/src/hooks';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { isMobile, subscribeIsMobile } from '@automattic/viewport';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { ZendeskConfigName } from '@automattic/help-center/src/hooks/use-zendesk-messaging';

export type KeyType = 'akismet' | 'jpAgency' | 'jpCheckout' | 'jpGeneral' | 'wpcom';

declare global {
	interface Window {
		zE: (
			action: string,
			value: string,
			handler?: ( callback: ( data: string | number ) => void ) => void
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

	const { canConnectToZendesk } = useChatStatus( group, enabled );
	const isEligibleForPresalesChat =
		enabled && isEnglishLocale && canConnectToZendesk && ! isWpMobileAppUser;

	const { data: chatAvailability, isInitialLoading: isLoadingAvailability } =
		useMessagingAvailability( group, isEligibleForPresalesChat && ! skipAvailabilityCheck );

	const isPresalesChatAvailable =
		skipAvailabilityCheck || Boolean( chatAvailability?.is_available );

	const isLoggedIn = useSelector( isUserLoggedIn );
	const zendeskKeyName = getConfigName( keyType );
	const { isMessagingScriptLoaded } = useZendeskMessaging(
		zendeskKeyName,
		isEligibleForPresalesChat && isPresalesChatAvailable,
		isLoggedIn
	);

	const openChat = () => {
		window.zE( 'messenger', 'open' );
	};

	/* When we subscribe to subscribeIsMobile, we need to force a re-render of the component each time the viewport width updates
	 * to ensure that the correct value is used for isMobile.
	 */
	const [ renderCount, setRenderCount ] = useState( 0 );
	useEffect( () => {
		return subscribeIsMobile( () => setRenderCount( ( count ) => count + 1 ) );
	}, [] );

	useEffect( () => {
		// presales chat is always shown by default
		if ( enabled && isPresalesChatAvailable && isMessagingScriptLoaded ) {
			window.zE( 'messenger', 'show' );
		}

		if ( isMobile() ) {
			window.zE( 'messenger', 'hide' );
		}
	}, [ enabled, isMessagingScriptLoaded, isPresalesChatAvailable, renderCount ] );

	return {
		isChatActive: isPresalesChatAvailable && isEligibleForPresalesChat,
		isLoading: isLoadingAvailability,
		isPresalesChatAvailable,
		openChat,
	};
}
