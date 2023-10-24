import { localizeUrl } from '@automattic/i18n-utils';
import type { Message } from '../types';

export const getOdieInitialMessages = ( botConfig: string | undefined ): Message[] => {
	if ( ! botConfig || botConfig === 'supportDocs' ) {
		return [
			{
				id: '1',
				type: 'message',
				content: 'Hey Wapuu! I need help with my site.',
				role: 'user',
			},
			{
				id: '2',
				type: 'placeholder',
				role: 'bot',
				content: '',
			},
			{
				id: '3',
				type: 'message',
				content: 'Cool thinking animation!',
				role: 'user',
			},
			{
				id: '4',
				type: 'message',
				content: `Hey, sure! Here you have a useful link to get started that will be useful [here](https://www.wordpress.com/) (a link in the middle of the message so we can test the link markdown processor)`,
				role: 'bot',
			},
			{
				id: '5',
				type: 'message',
				content: 'Thanks!',
				role: 'user',
			},
			{
				id: '6',
				type: 'message',
				content: 'Here some sources to learn more about WordPress',
				role: 'bot',
				sources: [
					'[WordPress.com Support](https://en.support.wordpress.com/)',
					'[WordPress.org Support Forums](https://wordpress.org/support/)',
				],
			},
		];
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
