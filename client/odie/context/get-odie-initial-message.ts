import { preventWidows } from 'calypso/lib/formatting';
import { Message, OdieAllowedBots } from '../types';

const getOdieInitialPrompt = ( botNameSlug: OdieAllowedBots = 'wpcom-support-chat' ): string => {
	switch ( botNameSlug ) {
		case 'wpcom-support-chat':
			return preventWidows(
				'Hello, I am Wapuu! How can I assist you with questions related to your WordPress.com site today? Feel free to ask!'
			);
		default:
			return 'Hello, I am your personal assistant.';
	}
};

export const getOdieInitialMessage = (
	botNameSlug: OdieAllowedBots = 'wpcom-support-chat'
): Message => {
	return {
		content: getOdieInitialPrompt( botNameSlug ),
		role: 'bot',
		type: 'introduction',
	};
};
