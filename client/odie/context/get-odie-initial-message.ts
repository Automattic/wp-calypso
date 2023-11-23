import { __ } from '@wordpress/i18n';
import { preventWidows } from 'calypso/lib/formatting';
import { Message, OdieAllowedBots } from '../types';

const getOdieInitialPrompt = ( botNameSlug: OdieAllowedBots ): string => {
	switch ( botNameSlug ) {
		case 'wpcom-support-chat':
			return preventWidows(
				__(
					'Hi there 👋 I’m Wapuu, WordPress.com’s AI assistant! Having an issue with your site or account? Tell me all about it and I’ll be happy to help.'
				)
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
