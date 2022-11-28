import config from '@automattic/calypso-config';
import { getLocaleSlug } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import ZendeskChat from 'calypso/components/zendesk-chat-widget';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { ConfigData } from '@automattic/create-calypso-config';

export const ZendeskPreSalesChat: React.VFC = () => {
	const zendeskChatKey = config( 'zendesk_presales_chat_key' ) as keyof ConfigData;
	const isLoggedIn = useSelector( isUserLoggedIn );

	const shouldShowZendeskPresalesChat = useMemo( () => {
		const isEnglishLocale = ( config( 'english_locales' ) as string[] ).includes(
			getLocaleSlug() ?? ''
		);
		const currentTime = new Date();

		/**
		 * This is for testing.. Remove this before merging..
		 * This forces the time to be within the time span thst the chat wiget will show.
		 */
		//currentTime.setUTCHours( 16 );

		return (
			! isLoggedIn &&
			isEnglishLocale &&
			isJetpackCloud() &&
			currentTime.getUTCHours() >= 15 &&
			currentTime.getUTCHours() < 21 &&
			currentTime.getUTCDay() !== 0 &&
			currentTime.getUTCDay() !== 6
		);
	}, [ isLoggedIn ] );

	return shouldShowZendeskPresalesChat ? <ZendeskChat chatId={ zendeskChatKey } /> : null;
};
