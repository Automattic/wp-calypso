import config from '@automattic/calypso-config';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { getLocaleSlug } from 'i18n-calypso';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import ZendeskChat from 'calypso/components/presales-zendesk-chat';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { ConfigData } from '@automattic/create-calypso-config';

function usePresalesAvailabilityQuery() {
	return useQuery(
		'presales-availability',
		async () => {
			const url = 'https://public-api.wordpress.com/wpcom/v2/presales/availability';
			const queryObject = {
				group: 'jp_presales',
			};

			const response = await apiFetch( {
				credentials: 'same-origin',
				mode: 'cors',
				url: addQueryArgs( url, queryObject as Record< string, string > ),
				parse: false, // Disable automatic JSON parsing
			} );

			const textResponse = await response.text(); // Extract plain text from the response

			// Convert the plain text response to a boolean
			const booleanResponse = textResponse.trim().toLowerCase() === 'true';
			return booleanResponse;
		},
		{
			meta: { persist: false },
		}
	);
}

export const ZendeskPreSalesChat: React.VFC = () => {
	const isStaffed = usePresalesAvailabilityQuery() ?? false;
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

	return shouldShowZendeskPresalesChat ? <ZendeskChat chatKey={ zendeskChatKey } /> : null;
};
