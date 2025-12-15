import { useHelpCenterContext } from '../contexts/HelpCenterContext';

export function useNewInteractionsBotConfig() {
	const { currentUser } = useHelpCenterContext();

	if ( ! currentUser?.ID ) {
		return {
			newInteractionsBotSlug: 'wpcom-chat-loggedout',
		};
	}

	return {};
}
