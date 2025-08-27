import { __ } from '@wordpress/i18n';
import { store } from '../state';
import getNoteIsRead from '../state/selectors/get-is-note-read';

export const getFilters = () => ( {
	all: {
		name: 'all',
		index: 0,
		label: __( 'All' ),
		emptyMessage: __( 'No notifications yet.' ),
		emptyLinkMessage: __( 'Get active! Comment on posts from blogs you follow.' ),
		emptyLink: 'https://wordpress.com/reader/',
		filter: () => true,
	},
	unread: {
		name: 'unread',
		index: 1,
		label: __( 'Unread' ),
		emptyMessage: __( "You're all caught up!" ),
		emptyLinkMessage: __( 'Reignite the conversation: write a new post.' ),
		emptyLink: 'https://wordpress.com/post/',
		filter: ( note ) => ! getNoteIsRead( store.getState(), note ),
	},
	comments: {
		name: 'comments',
		index: 2,
		label: __( 'Comments' ),
		emptyMessage: __( 'No new comments yet!' ),
		emptyLinkMessage: __(
			'Join a conversation: search for blogs that share your interests in the Reader.'
		),
		emptyLink: 'https://wordpress.com/reader/search/',
		filter: ( { type } ) => 'comment' === type,
	},
	follows: {
		name: 'follows',
		index: 3,
		label: __( 'Subscribers' ),
		emptyMessage: __( 'No new subscribers to report yet.' ),
		emptyLinkMessage: __( 'Get noticed: comment on posts you’ve read.' ),
		emptyLink: 'https://wordpress.com/activities/likes/',
		filter: ( { type } ) => 'follow' === type,
	},
	likes: {
		name: 'likes',
		index: 4,
		label: __( 'Likes' ),
		emptyMessage: __( 'No new likes to show yet.' ),
		emptyLinkMessage: __( 'Get noticed: comment on posts you‘ve read.' ),
		emptyLink: 'https://wordpress.com/activities/likes/',
		filter: ( { type } ) => 'comment_like' === type || 'like' === type,
	},
} );
