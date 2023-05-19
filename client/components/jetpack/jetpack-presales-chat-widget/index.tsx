import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import { getLocaleSlug } from 'i18n-calypso';
import { useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useMessagingAuth from 'calypso/../packages/help-center/src/hooks/use-messaging-auth';
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
	const { data: isStaffed } = useJpPresalesAvailabilityQuery( true );
	const zendeskChatKey: string | false = useMemo( () => {
		return config( get_config_chat_key( keyType ) );
	}, [ keyType ] );

	//get user's authentication key
	const { data: dataAuth, isLoading: isLoadingAuth } = useMessagingAuth( true );

	const zendeskJwt = dataAuth?.user?.jwt;
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

	useEffect( () => {
		if ( ! zendeskChatKey || isLoadingAuth ) {
			return;
		}
		const result = loadScript(
			'https://static.zdassets.com/ekr/snippet.js?key=' + encodeURIComponent( zendeskChatKey ),
			undefined,
			{ id: 'ze-snippet' }
		);
		//pass authentication key to Zendesk
		Promise.resolve( result ).then( () => {
			// Chat can't exist if we're not in a browser window
			if ( typeof window === 'undefined' ) {
				return;
			}
			// The `zE` function exposes the required action to authenticate the user
			if ( ! ( 'zE' in window ) || typeof window.zE !== 'function' ) {
				return;
			}
			// We need the user's authentication token to log them into chat
			if ( ! zendeskJwt ) {
				return;
			}
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore: TypeScript doesn't see the zE property added by the external script.
			window.zE( 'messenger', 'loginUser', function ( callback: ( jwt: string ) => void ) {
				callback( zendeskJwt );
			} );
		} );
	}, [ zendeskChatKey, zendeskJwt, isLoadingAuth ] );

	return shouldShowZendeskPresalesChat ? <ZendeskChat chatKey={ zendeskChatKey } /> : null;
};
