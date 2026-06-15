import {
	READER_SAVED_POST_SAVE,
	READER_SAVED_POST_UNSAVE,
	READER_SAVED_POSTS_RECEIVE,
	READER_SAVED_POSTS_REQUEST,
	READER_SAVED_POSTS_REQUEST_FAILURE,
	READER_SAVED_POSTS_REORDER,
	READER_SAVED_POST_MARK_READ,
	READER_SAVED_POST_MARK_UNREAD,
} from 'calypso/state/reader/action-types';
import type { PostKey } from './types';

export function savePost( postKey: PostKey ) {
	return {
		type: READER_SAVED_POST_SAVE,
		payload: { postKey },
	} as const;
}

export function unsavePost( postKey: PostKey ) {
	return {
		type: READER_SAVED_POST_UNSAVE,
		payload: { postKey },
	} as const;
}

export function requestSavedPosts() {
	return {
		type: READER_SAVED_POSTS_REQUEST,
	} as const;
}

export function receiveSavedPosts(
	items: Array< { postKey: PostKey; savedAt: string; position: number; isRead: boolean } >
) {
	return {
		type: READER_SAVED_POSTS_RECEIVE,
		payload: { items },
	} as const;
}

export function savedPostsRequestFailure( error: string ) {
	return {
		type: READER_SAVED_POSTS_REQUEST_FAILURE,
		payload: { error },
	} as const;
}

export function reorderSavedPosts( oldIndex: number, newIndex: number ) {
	return {
		type: READER_SAVED_POSTS_REORDER,
		payload: { oldIndex, newIndex },
	} as const;
}

export function markSavedPostRead( postKey: PostKey ) {
	return {
		type: READER_SAVED_POST_MARK_READ,
		payload: { postKey },
	} as const;
}

export function markSavedPostUnread( postKey: PostKey ) {
	return {
		type: READER_SAVED_POST_MARK_UNREAD,
		payload: { postKey },
	} as const;
}
