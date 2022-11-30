import config from '@automattic/calypso-config';
import { getLocaleSlug } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import ZendeskChat from 'calypso/components/presales-zendesk-chat';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { ConfigData } from '@automattic/create-calypso-config';

const isWithinChatHours = ( currentTime: Date ) => {
	const [ NINE_AM, SEVEN_PM ] = [ 9, 19 ];
	const [ SUNDAY, SATURDAY ] = [ 0, 6 ];

	const utcHour = currentTime.getUTCHours();
	const utcWeekDay = currentTime.getUTCDay();

	return (
		utcHour >= NINE_AM && utcHour < SEVEN_PM && utcWeekDay !== SUNDAY && utcWeekDay !== SATURDAY
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

	return shouldShowZendeskPresalesChat ? <ZendeskChat chatKey={ zendeskChatKey } /> : null;
};
