import type { CurrentUser } from '@automattic/data-stores';

export function getNewInteractionsBotConfig( currentUser?: CurrentUser ) {
	if ( ! currentUser?.ID ) {
		return {
			newInteractionsBotSlug: 'wpcom-chat-loggedout',
		};
	}

	return {};
}
