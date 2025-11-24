import config from '@automattic/calypso-config';
import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { __, sprintf } from '@wordpress/i18n';
import type { Context, Message, OdieAllowedBots, OdieAllBotSlugs } from './types';
declare const __i18n_text_domain__: string;

export const getOdieErrorMessage = (): string =>
	__(
		"Sorry, I'm offline right now. Leave our Support team a note and they'll get back to you as soon as possible.",
		__i18n_text_domain__
	);

export const getOdieErrorMessageUnknownError = (): string =>
	__( 'Sorry, an unknown error occurred. Please try again later.', __i18n_text_domain__ );

export const getOdieErrorMessageNonEligible = (): string =>
	__(
		'Sorry, I am offline right now. Come back later or ask for help in our forums:',
		__i18n_text_domain__
	);

export const getOdieRateLimitMessageContent = (): string =>
	__(
		"Hi there! You've hit your AI usage limit. Upgrade your plan for unlimited Wapuu support! You can still get user support using the buttons below.",
		__i18n_text_domain__
	);

export const getOdieRateLimitMessage = (): Message => ( {
	content: getOdieRateLimitMessageContent(),
	role: 'bot',
	type: 'message',
} );

export const getOdieForwardToForumsMessage = (): string =>
	__(
		'It sounds like you want to talk to a human. Human support is only available for our [paid plans](https://wordpress.com/pricing/). For community support, visit our forums:',
		__i18n_text_domain__
	);

export const getOdieForwardToZendeskMessage = ( userHasRecentOpenConversation: boolean ): string =>
	userHasRecentOpenConversation
		? __(
				'We noticed you have an ongoing conversation. Would you like to continue it?',
				__i18n_text_domain__
		  )
		: __(
				'Would you like to continue your conversation with a support agent?',
				__i18n_text_domain__
		  );

export function getFlowFromBotSlug( botSlug?: OdieAllBotSlugs ): string {
	if ( botSlug === 'ciab-workflow-support_chat' ) {
		return 'commerce-garden';
	}
	return 'wpcom';
}

export const getOdieTransferMessage = ( botSlug?: OdieAllBotSlugs ): Message[] => {
	const isTestMode = isTestModeEnvironment();
	const flow = getFlowFromBotSlug( botSlug );

	// Commerce garden has a simplified, single-message flow
	if ( flow === 'commerce-garden' ) {
		return [
			{
				content:
					( isTestMode ? '(STAGING VERSION OF ZENDESK) ' : '' ) +
					__(
						"Yes, of course! A Happiness Engineer is jumping in to help you now. They can see your chat with our assistant, so feel free to share any extra details; we'll take it from there.",
						__i18n_text_domain__
					),
				role: 'bot' as const,
				type: 'message' as const,
				context: {
					flags: {
						hide_disclaimer_content: true,
						show_contact_support_msg: true,
						show_ai_avatar: false,
					},
					site_id: null,
				},
			},
		];
	}

	const baseMessage = {
		content:
			__( 'No problem. Help is on the way!', __i18n_text_domain__ ) +
			( isTestMode ? ' (staging)' : '' ),
		role: 'bot' as const,
		type: 'message' as const,
		context: {
			flags: {
				hide_disclaimer_content: true,
				show_contact_support_msg: false,
				show_ai_avatar: false,
			},
			site_id: null,
		},
	};

	if ( isTestMode ) {
		return [
			baseMessage,
			{
				content: __(
					'This is the Sandbox version of Zendesk. You will not be redirected to a support agent. If you want to test the real experience and be connected to a support agent, you need to be unproxied.',
					__i18n_text_domain__
				),
				role: 'bot' as const,
				type: 'message' as const,
				context: {
					flags: {
						hide_disclaimer_content: true,
						show_contact_support_msg: true,
						show_ai_avatar: false,
					},
					site_id: null,
				},
			},
		];
	}

	return [
		baseMessage,
		{
			content: __(
				"We're connecting you with our support team. A Happiness Engineer will join the chat as soon as they're available.",
				__i18n_text_domain__
			),
			role: 'bot' as const,
			type: 'message' as const,
			context: {
				flags: {
					hide_disclaimer_content: true,
					show_contact_support_msg: true,
					show_ai_avatar: false,
				},
				site_id: null,
			},
		},
		{
			content: __(
				'They can see your chat with our AI assistant but please share any extra details while you wait so we can assist you better.',
				__i18n_text_domain__
			),
			role: 'bot' as const,
			type: 'message' as const,
			context: {
				flags: {
					hide_disclaimer_content: true,
					show_contact_support_msg: true,
					show_ai_avatar: false,
				},
				site_id: null,
			},
		},
	];
};

export const getOdieOnErrorTransferMessage = (): Message[] => [
	{
		content: getOdieErrorMessage(),
		role: 'bot',
		type: 'message',
		context: {
			flags: {
				hide_disclaimer_content: true,
				show_contact_support_msg: false,
				show_ai_avatar: true,
			},
			site_id: null,
		},
	},
];

export const getOdieThirdPartyMessageContent = (): string =>
	`${ __(
		'I’m happy to connect you to a human! However, it looks like 3rd party cookies are disabled in your browser. Please turn them on for our live chat to work properly. [Use our guide](https://wordpress.com/support/third-party-cookies/)',
		__i18n_text_domain__
	) } \n\n ${ __(
		'Once you’re done, you can come back here to start talking with someone by clicking on the following button.',
		__i18n_text_domain__
	) }`;

export const getOdieEmailFallbackMessageContent = ( isChatRestricted = false ): string => {
	const unavailableMessage = isChatRestricted
		? __(
				"I'm sorry, our human chat support is unavailable, but I'm here and ready to assist.",
				__i18n_text_domain__
		  )
		: __(
				"I'm sorry, our human chat support is down for maintenance, but I'm here and ready to assist.",
				__i18n_text_domain__
		  );

	const followUp = __( 'What can I help you with?', __i18n_text_domain__ );
	return `${ unavailableMessage } \n\n ${ followUp }`;
};

export const getOdieEmailFallbackMessage = (): Message => ( {
	content: getOdieEmailFallbackMessageContent(),
	role: 'bot',
	type: 'message',
	context: {
		flags: {
			show_contact_support_msg: false,
			forward_to_human_support: true,
		},
		question_tags: {
			inquiry_type: 'request-for-human-support',
		},
		site_id: null,
	},
} );

export const getExistingConversationMessage = (): Message => ( {
	content: '',
	role: 'bot',
	internal_message_id: 'existing-conversation-message',
	type: 'message',
	context: {
		question_tags: {
			inquiry_type: 'request-for-human-support',
		},
		flags: {
			forward_to_human_support: true,
		},
		site_id: null,
	},
} );

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

export const getOdieInitialMessage = (
	botNameSlug: OdieAllowedBots,
	displayName: string
): Message => {
	return {
		content: `**${ sprintf(
			/* translators: %(name)s: the user's display name */
			__( 'Howdy %(name)s 👋', __i18n_text_domain__ ),
			{
				name: displayName || 'there',
			}
		) }** \n\n ${ __(
			"I'm your personal AI assistant. I can help with any questions about your site or account.",
			__i18n_text_domain__
		) }`,
		role: 'bot',
		type: 'introduction',
		context: getOdieInitialPromptContext( botNameSlug ),
	};
};

export const getErrorMessageUnknownError = (): Message => {
	return {
		content: getOdieErrorMessageUnknownError(),
		role: 'bot',
		type: 'message',
		context: {
			site_id: null,
			flags: {
				show_ai_avatar: true,
				is_error_message: true,
			},
		},
	};
};

export const ODIE_THUMBS_DOWN_RATING_VALUE = 0;
export const ODIE_THUMBS_UP_RATING_VALUE = 1;

/**
 * NOTE: NEVER CHANGE THIS VALUE.
 * This value should never be changed. Otherwise the old interactions will be broken and users will not be able to continue their conversations.
 * Before October 2025, the botSlug was an attribute of the Help Center > Odie Client. So interactions did not have a botSlug property.
 * But since #106790, interactions have their own botSlug property. The value below is used as a fallback for legacy interactions that don't have it.
 * If you change it, legacy interactions will target a new bot (not their original one) and users will not be able to continue their conversations.
 * The reason we use 'wpcom-support-chat' as fallback, because it was the only bot available in the Help Center up to October 2025.
 */
export const ODIE_DEFAULT_BOT_SLUG_LEGACY = 'wpcom-support-chat';

/**
 * New interactions will target this bot slug and store it in the interaction object. All future events of those interactions will use this bot slug.
 */
export const ODIE_NEW_INTERACTIONS_BOT_SLUG = config.isEnabled( 'help-center/workflow' )
	? 'wpcom-workflow-support_chat'
	: 'wpcom-support-chat';

export const ODIE_ALLOWED_BOTS = [
	ODIE_DEFAULT_BOT_SLUG_LEGACY,
	'wpcom-plan-support',
	'wpcom-workflow-support_chat',
];

export const ODIE_ALL_BOT_SLUGS = [ ...ODIE_ALLOWED_BOTS, 'ciab-workflow-support_chat' ];
