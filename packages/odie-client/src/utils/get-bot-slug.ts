import { ODIE_DEFAULT_BOT_SLUG_LEGACY } from '../constants';

export const getBotSlug = (
	supportInteraction: { bot_slug: string } | undefined,
	newInteractionsBotSlug: string,
	loggedOutOdieBotSlug: string,
	isLoggedOutSession: boolean
): string => {
	if ( isLoggedOutSession ) {
		return loggedOutOdieBotSlug;
	}

	if ( supportInteraction ) {
		// Legacy support interactions have their botSlug set to `''`. We need to use the legacy bot slug for them.
		return supportInteraction.bot_slug || ODIE_DEFAULT_BOT_SLUG_LEGACY;
	}

	// When the interaction is undefined, it means we're sending the first message to Odie, which is done before the interaction is created.
	// In this case, we use the new interactions bot slug.
	return newInteractionsBotSlug;
};
