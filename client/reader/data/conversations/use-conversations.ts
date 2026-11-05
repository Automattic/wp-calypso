import {
	markReadConversationNotesMutation,
	readConversationsCommentsQuery,
	readConversationsQuery,
} from '@automattic/api-queries';
import {
	keepPreviousData,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import type { Commenter, Conversation, OwnComment } from './types';
import type {
	ReadConversation,
	ReadConversationOwnComment,
	ReadConversationPerson,
	ReadConversationsSort,
} from '@automattic/api-core';

export const getConversationKey = ( siteId: number | string, postId: number | string ) =>
	`${ siteId }-p-${ postId }`;

const toCommenter = ( { name, avatar }: ReadConversationPerson ): Commenter => ( {
	name,
	avatar: avatar ?? '',
} );

const toTimestamp = ( ...dates: ( string | null | undefined )[] ) => {
	const date = dates.find( Boolean );
	return date ? Date.parse( date ) : 0;
};

export const adaptReadConversation = ( conversation: ReadConversation ): Conversation => ( {
	key: conversation.id,
	siteId: conversation.blog_id,
	postId: conversation.post_id,
	title: conversation.post.title,
	url: conversation.post.url || undefined,
	excerpt: conversation.latest_comment?.excerpt ?? '',
	timestamp: toTimestamp( conversation.latest_comment?.date, conversation.post.date ),
	latestCommentId: conversation.latest_comment?.id,
	reason: conversation.reason,
	commenters: conversation.commenters.map( toCommenter ),
	commenterCount: conversation.commenter_count,
	unreadCount: conversation.unread_count ?? 0,
	unreadNoteIds: conversation.unread_note_ids,
	isFollowing: conversation.is_following,
} );

export const adaptReadConversationOwnComment = (
	row: ReadConversationOwnComment
): OwnComment => ( {
	key: row.id,
	siteId: row.blog_id,
	postId: row.post_id,
	commentId: row.comment_id,
	title: row.post.title,
	excerpt: row.comment.excerpt,
	timestamp: toTimestamp( row.comment.date ),
	author: toCommenter( row.comment.author ),
	newCommentCount: row.new_comment_count ?? 0,
} );

// Adapting per page keeps rows of untouched pages identical across cache updates.
const adaptedPages = new WeakMap< object, ( Conversation | OwnComment )[] >();

function adaptPage< Row, Item extends Conversation | OwnComment >(
	page: object,
	rows: Row[],
	adapt: ( row: Row ) => Item
): Item[] {
	let items = adaptedPages.get( page ) as Item[] | undefined;
	if ( ! items ) {
		items = rows.map( adapt );
		adaptedPages.set( page, items );
	}
	return items;
}

export function useConversations( {
	sort,
	search,
	refetchInterval,
}: {
	sort: ReadConversationsSort;
	search?: string;
	refetchInterval?: number;
} ) {
	const query = useInfiniteQuery( {
		...readConversationsQuery( { sort, search } ),
		placeholderData: keepPreviousData,
		// Refetching an infinite query refetches every page, so live updates stop once more are loaded.
		refetchInterval: ( { state } ) =>
			( state.data?.pages.length ?? 0 ) > 1 ? false : ( refetchInterval ?? false ),
	} );
	const { data } = query;
	const conversations = useMemo(
		() =>
			data?.pages.flatMap( ( page ) =>
				adaptPage( page, page.conversations, adaptReadConversation )
			) ?? [],
		[ data ]
	);

	return Object.assign( {}, query, {
		conversations,
		unreadTotal: data?.pages[ 0 ]?.unread_total ?? 0,
	} );
}

export function useOwnComments( {
	sort,
	search,
	enabled = true,
}: {
	sort: ReadConversationsSort;
	search?: string;
	enabled?: boolean;
} ) {
	const query = useInfiniteQuery( {
		...readConversationsCommentsQuery( { sort, search } ),
		placeholderData: keepPreviousData,
		enabled,
	} );
	const { data } = query;
	const comments = useMemo(
		() =>
			data?.pages.flatMap( ( page ) =>
				adaptPage( page, page.comments, adaptReadConversationOwnComment )
			) ?? [],
		[ data ]
	);

	return Object.assign( {}, query, { comments } );
}

export function useMarkConversationsRead() {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const translate = useTranslate();

	return useMutation( {
		...markReadConversationNotesMutation( queryClient ),
		// Here rather than in mutate(), which drops its callbacks once another mark starts.
		onError: () => dispatch( errorNotice( translate( 'Couldn’t mark as read. Try again.' ) ) ),
	} );
}
