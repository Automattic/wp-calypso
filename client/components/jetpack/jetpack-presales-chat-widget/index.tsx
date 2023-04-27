import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import { getLocaleSlug } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import ZendeskChat from 'calypso/components/presales-zendesk-chat';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { ConfigData } from '@automattic/create-calypso-config';

type PresalesChatResponse = {
	is_available: boolean;
};

//the API is rate limited if we hit the limit we'll back off and retry
async function fetchWithRetry(
	url: string,
	options: RequestInit,
	retries = 3,
	delay = 30000
): Promise< Response > {
	try {
		const response = await fetch( url, options );

		if ( response.status === 429 && retries > 0 ) {
			await new Promise( ( resolve ) => setTimeout( resolve, delay ) );
			return await fetchWithRetry( url, options, retries - 1, delay * 2 );
		}

		return response;
	} catch ( error ) {
		if ( retries > 0 ) {
			await new Promise( ( resolve ) => setTimeout( resolve, delay ) );
			return await fetchWithRetry( url, options, retries - 1, delay * 2 );
		}
		throw error;
	}
}

export const ZendeskJetpackChat: React.VFC = () => {
	const [ error, setError ] = useState( false );
	const { data: isStaffed } = usePresalesAvailabilityQuery();
	const zendeskChatKey = config( 'zendesk_presales_chat_key' ) as keyof ConfigData;
	const isLoggedIn = useSelector( isUserLoggedIn );
	const shouldShowZendeskPresalesChat = useMemo( () => {
		const isEnglishLocale = ( config( 'english_locales' ) as string[] ).includes(
			getLocaleSlug() ?? ''
		);

		return config.isEnabled( 'jetpack/zendesk-chat-for-logged-in-users' )
			? isEnglishLocale && isJetpackCloud() && isStaffed
			: ! isLoggedIn && isEnglishLocale && isJetpackCloud() && isStaffed;
	}, [ isStaffed, isLoggedIn ] );

	function usePresalesAvailabilityQuery() {
		//adding a safeguard to ensure if there's an unkown error with the widget it won't crash the whole app
		try {
			return useQuery< boolean, Error >(
				[ 'presales-availability' ],
				async () => {
					const url = 'https://public-api.wordpress.com/wpcom/v2/presales/chat';
					const queryObject = {
						group: 'jp_presales',
					};

					const response = await fetchWithRetry(
						addQueryArgs( url, queryObject as Record< string, string > ),
						{
							credentials: 'same-origin',
							mode: 'cors',
						}
					);

					if ( ! response.ok ) {
						throw new Error( `API request failed with status ${ response.status }` );
					}

					const data: PresalesChatResponse = await response.json();
					return data.is_available;
				},
				{
					meta: { persist: false },
				}
			);
		} catch ( error ) {
			setError( true );
			return { data: false };
		}
	}

	if ( error ) {
		return null;
	}

	return shouldShowZendeskPresalesChat ? <ZendeskChat chatKey={ zendeskChatKey } /> : null;
};
