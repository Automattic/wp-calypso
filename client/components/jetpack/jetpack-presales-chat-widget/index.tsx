import config from '@automattic/calypso-config';
import { getLocaleSlug } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import ZendeskChat from 'calypso/components/presales-zendesk-chat';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useJpPresalesAvailabilityQuery } from 'calypso/lib/jetpack/use-jp-presales-availability-query';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { ConfigData } from '@automattic/create-calypso-config';

export type KeyType = 'jpAgency' | 'jpCheckout' | 'akismet' | 'jpGeneral';

export interface ZendeskJetpackChatProps {
	keyType: KeyType;
}

// The akismet chat key is included here because the availability for Akismet presales is in the same group as Jetpack (jp_presales)
function get_config_chat_key( keyType: KeyType ): keyof ConfigData {
	const chatWidgetKeyMap = {
		jpAgency: 'zendesk_presales_chat_key_jp_agency_dashboard',
		jpCheckout: 'zendesk_presales_chat_key_jp_checkout',
		akismet: 'zendesk_presales_chat_key_akismet',
		jpGeneral: 'zendesk_presales_chat_key',
	};

	return chatWidgetKeyMap[ keyType ] ?? 'zendesk_presales_chat_key';
}

export const ZendeskJetpackChat: React.VFC< { keyType: KeyType } > = ( { keyType } ) => {
	const [ error, setError ] = useState( false );
	const { data: isStaffed } = useJpPresalesAvailabilityQuery( setError );
	const zendeskChatKey: string | false = useMemo( () => {
		return config( get_config_chat_key( keyType ) );
	}, [ keyType ] );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const shouldShowZendeskPresalesChat = useMemo( () => {
		const isEnglishLocale = ( config( 'english_locales' ) as string[] ).includes(
			getLocaleSlug() ?? ''
		);

		const isCorrectContext =
			( isAkismetCheckout() && keyType === 'akismet' ) ||
			( isJetpackCheckout() && keyType === 'jpCheckout' ) ||
			( isJetpackCloud() && ( keyType === 'jpAgency' || keyType === 'jpGeneral' ) );

		return config.isEnabled( 'jetpack/zendesk-chat-for-logged-in-users' )
			? isEnglishLocale && isCorrectContext && isStaffed
			: ! isLoggedIn && isEnglishLocale && isCorrectContext && isStaffed;
	}, [ isStaffed, isLoggedIn, keyType ] );

	if ( error ) {
		return null;
	}

	return shouldShowZendeskPresalesChat ? <ZendeskChat chatKey={ zendeskChatKey } /> : null;
};
