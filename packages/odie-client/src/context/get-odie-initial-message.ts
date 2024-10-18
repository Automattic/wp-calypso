import { ODIE_INITIAL_MESSAGE } from '../constants';
import type { Context, Message, OdieAllowedBots } from '../types/index';

const getOdieInitialPrompt = ( botNameSlug: OdieAllowedBots ): string => {
	switch ( botNameSlug ) {
		case 'wpcom-support-chat':
		case 'wpcom-plan-support':
			return ODIE_INITIAL_MESSAGE;
	}
};

const getOdieInitialPromptContext = ( botNameSlug: OdieAllowedBots ): Context | undefined => {
	switch ( botNameSlug ) {
		case 'wpcom-plan-support':
			return {
				flags: {
					forward_to_human_support: true,
				},
				site_id: null,
			};
		default:
			return undefined;
	}
};

export const getOdieInitialMessage = (
	botNameSlug: OdieAllowedBots,
	odieInitialPromptText?: string
): Message => {
	return {
		content: odieInitialPromptText || getOdieInitialPrompt( botNameSlug ),
		role: 'bot',
		type: 'introduction',
		context: getOdieInitialPromptContext( botNameSlug ),
	};
};
