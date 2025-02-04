import { store } from '../state';
import getNoteIsRead from '../state/selectors/get-is-note-read';

const Filters = {
	all: {
		name: 'all',
		index: 0,
		label: ( translate ) =>
			translate( 'All', {
				comment: "Notifications filter: all of a users' notifications",
			} ),
		emptyMessage: ( translate ) =>
			translate( 'No notifications yet.', {
				comment: 'Notifications all filter: no notifications',
			} ),
		emptyLinkMessage: ( translate ) =>
			translate( 'Get active! Comment on posts from blogs you follow.', {
				comment: 'Notifications all filter: no notifications',
			} ),
		emptyLink: 'https://wordpress.com/reader/',
		filter: () => true,
	},
	unread: {
		name: 'unread',
		index: 1,
		label: ( translate ) =>
			translate( 'Unread', {
				comment: 'Notifications filter: unread notifications',
			} ),
		emptyMessage: ( translate ) =>
			translate( "You're all caught up!", {
				comment: 'Notifications unread filter: no notifications',
			} ),
		emptyLinkMessage: ( translate ) =>
			translate( 'Reignite the conversation: write a new post.', {
				comment: 'Notifications unread filter: no notifications',
			} ),
		emptyLink: 'https://wordpress.com/post/',
		filter: ( note ) => ! getNoteIsRead( store.getState(), note ),
	},
	comments: {
		name: 'comments',
		index: 2,
		label: ( translate ) =>
			translate( 'Comments', {
				comment: 'Notifications filter: comment notifications',
			} ),
		emptyMessage: ( translate ) =>
			translate( 'No new comments yet!', {
				comment: 'Notifications comments filter: no notifications',
			} ),
		emptyLinkMessage: ( translate ) =>
			translate( 'Join a conversation: search for blogs that share your interests in the Reader.', {
				comment: 'Notifications comments filter: no notifications',
			} ),
		emptyLink: 'https://wordpress.com/reader/search/',
		filter: ( { type } ) => 'comment' === type,
	},
	follows: {
		name: 'follows',
		index: 3,
		label: ( translate ) =>
			translate( 'Subscribers', {
				comment: 'Notifications filter: notifications about users subscribing to your blogs',
			} ),
		emptyMessage: ( translate ) =>
			translate( 'No new subscribers to report yet.', {
				comment: 'Notifications subscribers filter: no notifications',
			} ),
		emptyLinkMessage: ( translate ) =>
			translate( "Get noticed: comment on posts you've read.", {
				comment: 'Notifications subscribers filter: no notifications',
			} ),
		emptyLink: 'https://wordpress.com/activities/likes/',
		filter: ( { type } ) => 'follow' === type,
	},
	likes: {
		name: 'likes',
		index: 4,
		label: ( translate ) =>
			translate( 'Likes', {
				comment: 'Notifications filter: notifications about users liking your posts or comments',
			} ),
		emptyMessage: ( translate ) =>
			translate( 'No new likes to show yet.', {
				comment: 'Notifications likes filter: no Notifications',
			} ),
		emptyLinkMessage: ( translate ) =>
			translate( "Get noticed: comment on posts you've read.", {
				comment: 'Notifications likes filter: no Notifications',
			} ),
		emptyLink: 'https://wordpress.com/activities/likes/',
		filter: ( { type } ) => 'comment_like' === type || 'like' === type,
	},
};

export default Filters;
