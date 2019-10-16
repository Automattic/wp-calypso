/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

export const streamLabels = {
	timeline: () => translate( 'Timeline' ),
	email: () => translate( 'Email' ),
};

export const settingLabels = {
	comment_like: () => translate( 'Likes on my comments' ),
	comment_reply: () => translate( 'Replies to my comments' ),

	new_comment: () => translate( 'Comments on my site' ),
	post_like: () => translate( 'Likes on my posts' ),
	follow: () => translate( 'Site follows' ),
	achievement: () => translate( 'Site achievements' ),
	mentions: () => translate( 'Username mentions' ),
	scheduled_publicize: () => translate( 'Post Publicized' ),

	store_order: () => translate( 'New order' ),
};

export const getLabelForStream = stream =>
	stream in streamLabels ? streamLabels[ stream ].call() : null;

export const getLabelForSetting = setting =>
	setting in settingLabels ? settingLabels[ setting ].call() : null;
