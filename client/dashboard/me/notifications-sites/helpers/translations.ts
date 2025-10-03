import { __ } from '@wordpress/i18n';

const translations = {
	comment_like: __( 'Likes on my comments' ),
	recommended_blog: __( 'Blog recommendations' ),
	new_comment: __( 'Comments on my site' ),
	post_like: __( 'Likes on my posts' ),
	follow: __( 'Subscriptions' ),
	achievement: __( 'Site achievements' ),
	mentions: __( 'Username mentions' ),
	scheduled_publicize: __( 'Jetpack Social' ),
	blogging_prompt: __( 'Daily writing prompts' ),
	draft_post_prompt: __( 'Draft post reminders' ),
	store_order: __( 'New order' ),
	comment_reply: __( 'Replies to my comments' ),
} as const;

type TranslationKey = keyof typeof translations;
type TranslationValue = ( typeof translations )[ TranslationKey ];

export const getFieldLabel = ( key: TranslationKey ): TranslationValue => {
	return translations[ key ] ?? key;
};
