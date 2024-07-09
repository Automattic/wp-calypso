import { __ } from '@wordpress/i18n';
import { Message, OdieAllowedBots } from '../types/index';

const getOdieInitialPrompt = ( botNameSlug: OdieAllowedBots ): string => {
	switch ( botNameSlug ) {
		case 'wpcom-support-chat':
			return __(
				'Hi there 👋 I’m Wapuu, WordPress.com’s AI assistant! Having an issue with your site or account? Tell me all about it and I’ll be happy to help.',
				__i18n_text_domain__
			);
	}
};

export const getOdieInitialMessage = ( botNameSlug: OdieAllowedBots ): Message => {
	return {
		content: getOdieInitialPrompt( botNameSlug ),
		role: 'bot',
		type: 'introduction',
	};
};
