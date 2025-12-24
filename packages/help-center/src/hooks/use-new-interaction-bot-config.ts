import type { CurrentUser } from '@automattic/data-stores';

export function useNewInteractionsBotConfig( currentUser?: CurrentUser ) {
	if ( ! currentUser?.ID ) {
		return {
			newInteractionsBotSlug: 'wpcom-chat-loggedout',
		};
	}

	return {};
}
