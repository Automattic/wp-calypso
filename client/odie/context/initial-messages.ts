import { localizeUrl } from '@automattic/i18n-utils';
import type { Message } from '../types';

export const getOdieInitialMessages = ( botConfig: string | undefined ): Message[] => {
	if ( ! botConfig || botConfig === 'supportDocs' ) {
		return [];
	}

	return [
		{
			content: 'Quick-Start Guide',
			role: 'bot',
			type: 'help-link',
			meta: {
				link: localizeUrl( 'https://wordpress.com/support/start/' ),
				action: 'get-support-docs',
				message: 'Show me the quick-start guide',
			},
		},
		{
			content: 'All about Domains',
			role: 'bot',
			type: 'help-link',
			meta: {
				link: localizeUrl( 'https://wordpress.com/support/domains/' ),
				action: 'get-support-docs',
				message: 'Show me the domains guide',
			},
		},
		{
			content: 'WordPress.com Plans',
			role: 'bot',
			type: 'help-link',
			meta: {
				link: localizeUrl( 'https://wordpress.com/support/plans/' ),
				action: 'get-support-docs',
				message: 'Show me the plans guide',
			},
		},
		{
			content: 'Wordpress.com Add-Ons',
			role: 'bot',
			type: 'help-link',
			meta: {
				link: localizeUrl( 'https://wordpress.com/support/add-ons/' ),
				action: 'get-support-docs',
				message: 'Show me the add-ons guide',
			},
		},
		{
			content: 'Add Email to your Domain',
			role: 'bot',
			type: 'help-link',
			meta: {
				link: localizeUrl( 'https://wordpress.com/support/email/' ),
				action: 'get-support-docs',
				message: 'Show me the email guide',
			},
		},
	];
};
