//temp ignore linter console.log stuff
/* eslint-disable no-console */

import config from '@automattic/calypso-config';
import { useHappychatAuth } from '@automattic/happychat-connection';
import { loadScript } from '@automattic/load-script';
import { getLocaleSlug } from 'i18n-calypso';
import { useMemo, useState, useEffect } from 'react';
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
	zendeskdJwt: string | null; // Add JWT prop
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

	const { data: dataAuth, isLoading: isLoadingAuth } = useHappychatAuth(); // call the hook
	console.log( 'dataAuth:', dataAuth );
	const zendeskdJwt = dataAuth?.user?.jwt;
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
			// Add isLoadingAuth check
			console.log( 'Zendesk chat key is not provided or auth data is still loading.' );
			return;
		}

		const result = loadScript(
			'https://static.zdassets.com/ekr/snippet.js?key=' + encodeURIComponent( zendeskChatKey ),
			undefined,
			{ id: 'ze-snippet' }
		);

		Promise.resolve( result ).then( () => {
			if ( typeof window !== 'undefined' ) {
				window.zE = window.zE || [];
				console.log( 'ze', window.zE );

				if ( zendeskdJwt && typeof window.zE === 'function' ) {
					window.zE( 'messenger', 'loginUser', function ( callback ) {
						callback( zendeskdJwt );
					} );
					console.log( 'Authenticated with JWT.' );
				} else if ( zendeskdJwt ) {
					console.log( 'window.zE is not a function.' );
				} else {
					console.log( 'No JWT provided for authentication.' );
				}
			} else {
				console.log( 'window object is undefined.' );
			}
		} );
	}, [ zendeskChatKey, zendeskdJwt, isLoadingAuth ] ); // Add isLoadingAuth to dependencies array

	if ( error ) {
		console.log( 'Error occurred in ZendeskJetpackChat component.' );
		return null;
	}

	return shouldShowZendeskPresalesChat ? (
		<ZendeskChat chatKey={ zendeskChatKey } zendeskdJwt={ zendeskdJwt } />
	) : null;
};
