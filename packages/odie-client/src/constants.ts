import { __ } from '@wordpress/i18n';
import type { Message } from './types';
declare const __i18n_text_domain__: string;

export const ODIE_ERROR_MESSAGE = __(
	"Sorry, I'm offline right now. Leave our Support team a note and they'll get back to you as soon as possible.",
	__i18n_text_domain__
);

export const ODIE_RATE_LIMIT_MESSAGE = __(
	"Hi there! You've hit your AI usage limit. Upgrade your plan for unlimited Wapuu support! You can still get user support using the buttons below.",
	__i18n_text_domain__
);

export const ODIE_INITIAL_MESSAGE = __(
	'👋 Howdy, I’m WordPress.com’s support assistant. I can help with questions about your site or account.',
	__i18n_text_domain__
);

export const ODIE_FORWARD_TO_FORUMS_MESSAGE = __(
	'It sounds like you want to talk to a human. Human support is only available for our [paid plans](https://wordpress.com/pricing/). For community support, visit our forums:',
	__i18n_text_domain__
);

export const ODIE_FORWARD_TO_ZENDESK_MESSAGE = __(
	'It sounds like you want to talk to a human. We’re here to help! Use the option below to message our Happiness Engineers.',
	__i18n_text_domain__
);

export const ODIE_TRANSFER_MESSAGE: Message[] = [
	{
		content: __( 'No problem. Help is on the way!', __i18n_text_domain__ ),
		role: 'bot',
		type: 'message',
		context: {
			flags: {
				hide_disclaimer_content: true,
				show_contact_support_msg: false,
				show_ai_avatar: false,
			},
			site_id: null,
		},
	},
];

export const ODIE_THIRD_PARTY_MESSAGE = `${ __(
	'I’m happy to connect you to a human! However, it looks like 3rd party cookies are disabled in your browser. Please turn them on for our live chat to work properly. [Use our guide](https://wordpress.com/support/third-party-cookies/)',
	__i18n_text_domain__
) } \n\n ${ __(
	'Once you’re done, you can come back here to start talking with someone by clicking on the following button.',
	__i18n_text_domain__
) }`;

export const ODIE_WRONG_FILE_TYPE_MESSAGE: Message = {
	content: __(
		'Sorry! The file you are trying to upload is not supported. Please upload a .jpg, .png, or .gif file.',
		__i18n_text_domain__
	),
	role: 'bot',
	type: 'message',
	context: {
		flags: {
			hide_disclaimer_content: true,
			show_contact_support_msg: false,
		},
		site_id: null,
	},
};

export const ODIE_THUMBS_DOWN_RATING_VALUE = 0;
export const ODIE_THUMBS_UP_RATING_VALUE = 1;
export const ODIE_ALLOWED_BOTS = [ 'wpcom-support-chat', 'wpcom-plan-support' ];
