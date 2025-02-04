import { ODIE_INITIAL_MESSAGE } from '../constants';
import type { Context, Message, OdieAllowedBots } from '../types';

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

export const getOdieInitialMessage = ( botNameSlug: OdieAllowedBots ): Message => {
	return {
		content: ODIE_INITIAL_MESSAGE,
		role: 'bot',
		type: 'introduction',
		context: getOdieInitialPromptContext( botNameSlug ),
	};
};
