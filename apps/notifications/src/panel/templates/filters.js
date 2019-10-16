/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

import { store } from '../state';

import getNoteIsRead from '../state/selectors/get-is-note-read';

export const Filters = {
	all: function() {
		return {
			name: 'all',
			index: 0,
			label: translate( 'All', {
				comment: "Notifications filter: all of a users' notifications",
			} ),
			emptyMessage: translate( 'No notifications yet.', {
				comment: 'Notifications all filter: no notifications',
			} ),
			emptyLinkMessage: translate( 'Get active! Comment on posts from blogs you follow.', {
				comment: 'Notifications all filter: no notifications',
			} ),
			emptyLink: 'https://wordpress.com/read/',

			filter: () => true,
		};
	},
	unread: function() {
		return {
			name: 'unread',
			index: 1,
			label: translate( 'Unread', {
				comment: 'Notifications filter: unread notifications',
			} ),
			emptyMessage: translate( "You're all caught up!", {
				comment: 'Notifications unread filter: no notifications',
			} ),
			emptyLinkMessage: translate( 'Reignite the conversation: write a new post.', {
				comment: 'Notifications unread filter: no notifications',
			} ),
			emptyLink: 'https://wordpress.com/post/',

			filter: note => ! getNoteIsRead( store.getState(), note ),
		};
	},
	comments: function() {
		return {
			name: 'comments',
			index: 2,
			label: translate( 'Comments', {
				comment: 'Notifications filter: comment notifications',
			} ),
			emptyMessage: translate( 'No new comments yet!', {
				comment: 'Notifications comments filter: no notifications',
			} ),
			emptyLinkMessage: translate(
				'Join a conversation: search for blogs that share your interests in the Reader.',
				{
					comment: 'Notifications comments filter: no notifications',
				}
			),
			emptyLink: 'https://wordpress.com/read/search/',

			filter: ( { type } ) => 'comment' === type,
		};
	},
	follows: function() {
		return {
			name: 'follows',
			index: 3,
			label: translate( 'Follows', {
				comment: 'Notifications filter: notifications about users following your blogs',
			} ),
			emptyMessage: translate( 'No new followers to report yet.', {
				comment: 'Notifications follows filter: no notifications',
			} ),
			emptyLinkMessage: translate( "Get noticed: comment on posts you've read.", {
				comment: 'Notifications follows filter: no notifications',
			} ),
			emptyLink: 'https://wordpress.com/activities/likes/',

			filter: ( { type } ) => 'follow' === type,
		};
	},
	likes: function() {
		return {
			name: 'likes',
			index: 4,
			label: translate( 'Likes', {
				comment: 'Notifications filter: notifications about users liking your posts or comments',
			} ),
			emptyMessage: translate( 'No new likes to show yet.', {
				comment: 'Notifications likes filter: no Notifications',
			} ),
			emptyLinkMessage: translate( "Get noticed: comment on posts you've read.", {
				comment: 'Notifications likes filter: no Notifications',
			} ),
			emptyLink: 'https://wordpress.com/activities/likes/',

			filter: ( { type } ) => 'comment_like' === type || 'like' === type,
		};
	},
};

export default Filters;
