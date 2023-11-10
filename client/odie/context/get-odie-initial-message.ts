import { __ } from '@wordpress/i18n';
import { Message, OdieAllowedBots } from '../types';
import { preventWidows } from '../utils/prevent-widows';

const getOdieInitialPrompt = ( botNameSlug: OdieAllowedBots = 'wpcom-support-chat' ): string => {
	switch ( botNameSlug ) {
		case 'wpcom-support-chat':
			return preventWidows(
				__(
					'Hi there 👋 I’m Wapuu, WordPress.com’s AI assistant! Having an issue with your site or account? Tell me all about it and I’ll be happy to help.'
				)
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
