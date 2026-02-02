import { HelpCenter, HelpCenterSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useLocation } from 'react-router-dom';

const HELP_CENTER_STORE = HelpCenter.register();

export const useLoggedOutSession = () => {
	const location = useLocation();
	const params = new URLSearchParams( location.search );

	// Primary: URL params (for active sessions where router is in control)
	const urlChatId = params.get( 'chatId' );
	const urlSessionId = params.get( 'sessionId' );
	const urlBotSlug = params.get( 'botSlug' );

	// Fallback: persisted store (for session restoration after Help Center is reopened)
	const { currentUser, persistedLoggedOutOdieChat } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentUser: store.getCurrentUser(),
			persistedLoggedOutOdieChat: store.getLoggedOutOdieChat(),
		};
	}, [] );

	const isLoggedIn = !! currentUser?.ID;

	// Use URL params if available, fall back to persisted session only when logged out
	const loggedOutOdieChatId =
		urlChatId || ( ! isLoggedIn && persistedLoggedOutOdieChat?.odieId?.toString() ) || null;
	const loggedOutOdieSessionId =
		urlSessionId || ( ! isLoggedIn && persistedLoggedOutOdieChat?.sessionId ) || null;
	const loggedOutOdieBotSlug =
		urlBotSlug || ( ! isLoggedIn && persistedLoggedOutOdieChat?.botSlug ) || null;

	const isLoggedOutSession =
		! isLoggedIn || ( loggedOutOdieChatId && loggedOutOdieSessionId && loggedOutOdieBotSlug );

	if ( isLoggedOutSession ) {
		return {
			isLoggedOutSession: true,
			loggedOutOdieChatId: loggedOutOdieChatId,
			sessionId: loggedOutOdieSessionId,
			botSlug: loggedOutOdieBotSlug,
		};
	}

	return {
		isLoggedOutSession: false,
		odieId: undefined,
		sessionId: undefined,
		botSlug: undefined,
	};
};
