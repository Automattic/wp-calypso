import config from '@automattic/calypso-config';
import { getLocaleSlug } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import ZendeskChat from 'calypso/components/zendesk-chat-widget';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { ConfigData } from '@automattic/create-calypso-config';

const isWithinChatHours = ( currentTime: Date ) => {
	const [ THREE_PM, NINE_PM ] = [ 15, 21 ];
	const [ SUNDAY, SATURDAY ] = [ 0, 6 ];

	const utcHour = currentTime.getUTCHours();
	const utcWeekDay = currentTime.getUTCDay();

	return (
		utcHour >= THREE_PM && utcHour < NINE_PM && utcWeekDay !== SUNDAY && utcWeekDay !== SATURDAY
	);
};

export const ZendeskPreSalesChat: React.VFC = () => {
	const zendeskChatKey = config( 'zendesk_presales_chat_key' ) as keyof ConfigData;
	const isLoggedIn = useSelector( isUserLoggedIn );

	const shouldShowZendeskPresalesChat = useMemo( () => {
		const isEnglishLocale = ( config( 'english_locales' ) as string[] ).includes(
			getLocaleSlug() ?? ''
		);
		const currentTime = new Date();

		return ! isLoggedIn && isEnglishLocale && isJetpackCloud() && isWithinChatHours( currentTime );
	}, [ isLoggedIn ] );

	return shouldShowZendeskPresalesChat ? <ZendeskChat chatId={ zendeskChatKey } /> : null;
};
