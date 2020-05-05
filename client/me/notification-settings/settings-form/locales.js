import i18n from 'i18n-calypso';

export const streamLabels = {
	timeline: () => i18n.translate( 'Timeline' ),
	email: () => i18n.translate( 'Email' ),
};

export const settingLabels = {
	comment_like: () => i18n.translate( 'Likes on my comments' ),
	comment_reply: () => i18n.translate( 'Replies to my comments' ),

	new_comment: () => i18n.translate( 'Comments on my site' ),
	post_like: () => i18n.translate( 'Likes on my posts' ),
	follow: () => i18n.translate( 'Site follows' ),
	achievement: () => i18n.translate( 'Site achievements' ),
	mentions: () => i18n.translate( 'Username mentions' ),
	scheduled_publicize: () => i18n.translate( 'Post Publicized' ),

	store_order: () => i18n.translate( 'New order' ),
};

export const getLabelForStream = ( stream ) =>
	stream in streamLabels ? streamLabels[ stream ].call() : null;

export const getLabelForSetting = ( setting ) =>
	setting in settingLabels ? settingLabels[ setting ].call() : null;
