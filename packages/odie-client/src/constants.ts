import { __ } from '@wordpress/i18n';
import type { Message } from './types';
declare const __i18n_text_domain__: string;

export const ODIE_ERROR_MESSAGE = ( shouldUseHelpCenterExperience: boolean | undefined ) => {
	if ( shouldUseHelpCenterExperience ) {
		return __(
			"Sorry, I'm offline right now. Leave our Support team a note and they'll get back to you as soon as possible.",
			__i18n_text_domain__
		);
	}
	return __(
		"Wapuu oopsie! 😺 I'm in snooze mode and can't chat just now. Don't fret, just browse through the buttons below to connect with WordPress.com support.",
		__i18n_text_domain__
	);
};

export const ODIE_RATE_LIMIT_MESSAGE = __(
	"Hi there! You've hit your AI usage limit. Upgrade your plan for unlimited Wapuu support! You can still get user support using the buttons below.",
	__i18n_text_domain__
);

export const ODIE_INITIAL_MESSAGE_NEW = __(
	'👋 Howdy, I’m WordPress.com’s support assistant. I can help with questions about your site or account.',
	__i18n_text_domain__
);

export const ODIE_INITIAL_MESSAGE = __(
	'Hi there 👋 I’m Wapuu, WordPress.com’s AI assistant! Having an issue with your site or account? Tell me all about it and I’ll be happy to help.',
	__i18n_text_domain__
);

export const getOdieInitialMessageConstant = (
	shouldUseHelpCenterExperience: boolean | undefined
) => {
	if ( shouldUseHelpCenterExperience ) {
		return ODIE_INITIAL_MESSAGE_NEW;
	}
	return ODIE_INITIAL_MESSAGE;
};

export const ODIE_FORWARD_TO_FORUMS_MESSAGE = __(
	'It sounds like you want to talk to a human. Human support is only available for our [paid plans](https://wordpress.com/pricing/). For community support, visit our forums:',
	__i18n_text_domain__
);

export const ODIE_FORWARD_TO_ZENDESK_MESSAGE = __(
	'It sounds like you want to talk to a human. We’re here to help! Use the option below to message our Happiness Engineers.',
	__i18n_text_domain__
);

export const ODIE_TRANSFER_MESSAGE = (
	shouldUseHelpCenterExperience: boolean | undefined
): Message => ( {
	content: shouldUseHelpCenterExperience
		? "Help's on the way!"
		: "We're connecting you to our support team.",
	role: 'bot',
	type: 'message',
	context: {
		flags: {
			hide_disclaimer_content: true,
			show_contact_support_msg: true,
		},
		site_id: null,
	},
} );

export const ODIE_THUMBS_DOWN_RATING_VALUE = 0;
export const ODIE_THUMBS_UP_RATING_VALUE = 1;
export const ODIE_ALLOWED_BOTS = [ 'wpcom-support-chat', 'wpcom-plan-support' ];
