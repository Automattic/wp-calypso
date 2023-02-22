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
	//open and close hours, currently 09:00 - 19:00 UTC
	const [ OPEN_HOUR, CLOSE_HOUR ] = [ 9, 19 ];
	const utcHour = currentTime.getUTCHours();
	const utcWeekDay = currentTime.getUTCDay();

	//if current hour is within open and close hour range and day is not saturday or sunday, return true
	return (
		utcHour >= OPEN_HOUR && utcHour < CLOSE_HOUR && utcWeekDay !== SUNDAY && utcWeekDay !== SATURDAY
	);
};

const isWithinShutdownDates = ( currentTime: Date ) => {
	const startTime = new Date( Date.UTC( 2022, 11, 23 ) ); // Thu Dec 22 2022 19:00:00 (7:00pm) GMT-0500 (Eastern Standard Time)
	const endTime = new Date( Date.UTC( 2023, 0, 2 ) ); // Sun Jan 01 2023 19:00:00 (7:00pm) GMT-0500 (Eastern Standard Time)
	const currentDateUTC = new Date( currentTime.toUTCString() );
	if ( currentDateUTC > startTime && currentDateUTC < endTime ) {
		return true;
	}
	return false;
};

export const ZendeskPreSalesChat: React.VFC = () => {
	const zendeskChatKey = config( 'zendesk_presales_chat_key' ) as keyof ConfigData;
	const isLoggedIn = useSelector( isUserLoggedIn );

	const shouldShowZendeskPresalesChat = useMemo( () => {
		const currentTime = new Date();
		if ( isWithinShutdownDates( currentTime ) ) {
			return false;
		}
		const isEnglishLocale = ( config( 'english_locales' ) as string[] ).includes(
			getLocaleSlug() ?? ''
		);

		return config.isEnabled( 'jetpack/zendesk-chat-for-logged-in-users' )
			? isEnglishLocale && isJetpackCloud() && isWithinAvailableChatDays( currentTime )
			: ! isLoggedIn &&
					isEnglishLocale &&
					isJetpackCloud() &&
					isWithinAvailableChatDays( currentTime );
	}, [ isLoggedIn ] );

	return shouldShowZendeskPresalesChat ? <ZendeskChat chatKey={ zendeskChatKey } /> : null;
};
