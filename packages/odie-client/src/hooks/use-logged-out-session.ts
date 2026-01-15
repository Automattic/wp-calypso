import { HelpCenter, HelpCenterSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useLocation } from 'react-router-dom';

const HELP_CENTER_STORE = HelpCenter.register();

export const useLoggedOutSession = () => {
	const location = useLocation();
	const params = new URLSearchParams( location.search );
	// We use these values to identify the logged out chat, not the ones from the data store, to keep the router in charge of the state.
	const loggedOutOdieChatId = params.get( 'chatId' );
	const loggedOutOdieSessionId = params.get( 'sessionId' );
	const loggedOutOdieBotSlug = params.get( 'botSlug' );

	const currentUser = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getCurrentUser(),
		[]
	);
	const isLoggedIn = !! currentUser?.ID;

	const isLoggedOutSession =
		! isLoggedIn || ( loggedOutOdieChatId && loggedOutOdieSessionId && loggedOutOdieBotSlug );

	if ( ! isLoggedOutSession ) {
		return {
			isLoggedOutSession: false,
			odieId: undefined,
			sessionId: undefined,
			botSlug: undefined,
		};
	}

	return {
		isLoggedOutSession: true,
		loggedOutOdieChatId: loggedOutOdieChatId,
		sessionId: loggedOutOdieSessionId,
		botSlug: loggedOutOdieBotSlug,
	};
};
