import config from '@automattic/calypso-config';
import { getLocaleSlug } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import ZendeskChat from 'calypso/components/presales-zendesk-chat';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { ConfigData } from '@automattic/create-calypso-config';

const isWithinAvailableChatDays = ( currentTime: Date ) => {
	const [ SUNDAY, SATURDAY ] = [ 0, 6 ];
	const utcWeekDay = currentTime.getUTCDay();

	return utcWeekDay !== SUNDAY && utcWeekDay !== SATURDAY;
};

export const ZendeskPreSalesChat: React.VFC = () => {
	const zendeskChatKey = config( 'zendesk_presales_chat_key' ) as keyof ConfigData;
	const isLoggedIn = useSelector( isUserLoggedIn );

	const shouldShowZendeskPresalesChat = useMemo( () => {
		const isEnglishLocale = ( config( 'english_locales' ) as string[] ).includes(
			getLocaleSlug() ?? ''
		);
		const currentTime = new Date();

		return config.isEnabled( 'jetpack/zendesk-chat-for-logged-in-users' )
			? isEnglishLocale && isJetpackCloud() && isWithinAvailableChatDays( currentTime )
			: ! isLoggedIn &&
					isEnglishLocale &&
					isJetpackCloud() &&
					isWithinAvailableChatDays( currentTime );
	}, [ isLoggedIn ] );

	return shouldShowZendeskPresalesChat ? <ZendeskChat chatKey={ zendeskChatKey } /> : null;
};
