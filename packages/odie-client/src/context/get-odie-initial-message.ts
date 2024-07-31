import { __ } from '@wordpress/i18n';
import { Context, Message, OdieAllowedBots } from '../types/index';

const getOdieInitialPrompt = ( botNameSlug: OdieAllowedBots ): string => {
	switch ( botNameSlug ) {
		case 'wpcom-support-chat':
		case 'wpcom-downgrade':
			return __(
				'Hi there 👋 I’m Wapuu, WordPress.com’s AI assistant! Having an issue with your site or account? Tell me all about it and I’ll be happy to help.',
				__i18n_text_domain__
			);
	}
};

const getOdieInitialPromptContext = ( botNameSlug: OdieAllowedBots ): Context | undefined => {
	switch ( botNameSlug ) {
		case 'wpcom-downgrade':
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
