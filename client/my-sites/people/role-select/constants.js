/**
 * External dependnecies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */

export const ROLE_ADMINISTRATOR = 'administrator';
export const ROLE_EDITOR = 'editor';
export const ROLE_AUTHOR = 'author';
export const ROLE_CONTRIBUTOR = 'contributor';
export const ROLE_FOLLOWER = 'follower';
export const ROLE_SUBSCRIBER = 'subscriber';

export const ROLES_LIST = {
	[ ROLE_ADMINISTRATOR ]: {
		getDescription: () =>
			i18n.translate(
				'Full power over the site: can invite people, modify the site settings, etc.'
			),
	},

	[ ROLE_EDITOR ]: {
		getDescription: ( isWPForTeamsSite ) =>
			isWPForTeamsSite
				? i18n.translate( 'Has access to all posts and pages (recommended).' )
				: i18n.translate( 'Has access to all posts and pages.' ),
	},

	[ ROLE_AUTHOR ]: {
		getDescription: ( isWPForTeamsSite ) =>
			isWPForTeamsSite
				? i18n.translate( 'Can write, upload files to, edit, and publish their own posts.' )
				: i18n.translate( 'Can write, upload photos to, edit, and publish their own posts.' ),
	},

	[ ROLE_CONTRIBUTOR ]: {
		getDescription: () =>
			i18n.translate( "Can write and edit their own posts but can't publish them." ),
	},

	[ ROLE_FOLLOWER ]: {
		getDescription: () => i18n.translate( 'Can read and comment on posts and pages.' ),
	},

	[ ROLE_SUBSCRIBER ]: {
		getDescription: () => i18n.translate( 'Can read and comment on posts and pages.' ),
	},
};
