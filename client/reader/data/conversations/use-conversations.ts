import {
	hasLoadedMorePages,
	markReadConversationNotesMutation,
	readConversationsCommentsQuery,
	readConversationsQuery,
	unfollowReadConversationMutation,
} from '@automattic/api-queries';
import {
	keepPreviousData,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { updateConversationFollowStatus } from 'calypso/state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import type { Commenter, Conversation, ConversationPostDetails, OwnComment } from './types';
import type {
	ReadConversation,
	ReadConversationOwnComment,
	ReadConversationPerson,
	ReadConversationsScope,
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

const toPostDetails = ( { post, site }: ReadConversation ): ConversationPostDetails | undefined =>
	post.discussion && post.excerpt !== undefined
		? {
				siteName: site.name,
				siteIcon: site.icon,
				author: post.author ?? null,
				date: post.date,
				excerpt: decodeEntities( stripHTML( post.excerpt ) ).trim(),
				image: post.featured_image || null,
				discussion: post.discussion,
			}
		: undefined;

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
	unreadCommentIds: conversation.unread_comment_ids,
	isFollowing: conversation.is_following,
	postDetails: toPostDetails( conversation ),
} );

export const adaptReadConversationOwnComment = (
	row: ReadConversationOwnComment
): OwnComment => ( {
	// Keyed by post, so a row keeps its key when a newer comment replaces it.
	key: getConversationKey( row.blog_id, row.post_id ),
	siteId: row.blog_id,
	postId: row.post_id,
	commentId: row.comment_id,
	title: row.post.title,
	excerpt: row.comment.excerpt,
	timestamp: toTimestamp( row.comment.date ),
	author: toCommenter( row.comment.author ),
	newCommentCount: row.new_comment_count ?? 0,
} );

// Adapting each page's rows once keeps rows of untouched pages identical across cache updates.
const adaptedPages = new WeakMap< object[], ( Conversation | OwnComment )[] >();

function adaptPage< Row extends object, Item extends Conversation | OwnComment >(
	rows: Row[],
	adapt: ( row: Row ) => Item
): Item[] {
	let items = adaptedPages.get( rows ) as Item[] | undefined;
	if ( ! items ) {
		items = rows.map( adapt );
		adaptedPages.set( rows, items );
	}
	return items;
}

export function useConversations( {
	sort,
	search,
	scope,
	refetchInterval,
	enabled = true,
}: {
	sort: ReadConversationsSort;
	search?: string;
	scope?: ReadConversationsScope;
	refetchInterval?: number;
	enabled?: boolean;
} ) {
	const query = useInfiniteQuery( {
		...readConversationsQuery( { sort, search, scope } ),
		placeholderData: keepPreviousData,
		enabled,
		refetchInterval: ( query ) => ! hasLoadedMorePages( query ) && ( refetchInterval ?? false ),
	} );
	const { data } = query;
	const conversations = useMemo(
		() =>
			data?.pages.flatMap( ( page ) => adaptPage( page.conversations, adaptReadConversation ) ) ??
			[],
		[ data ]
	);

	return Object.assign( {}, query, {
		conversations,
		unreadTotal: data?.pages[ 0 ]?.unread_total ?? 0,
	} );
}

/**
 * Lists each post once, at its first row's place, with the user's latest comment on it. The
 * endpoint returns a row per comment, and with a search only the comments that match.
 */
function groupByPost( comments: OwnComment[] ): OwnComment[] {
	const byPost = new Map< string, OwnComment >();
	for ( const comment of comments ) {
		const kept = byPost.get( comment.key );
		// Comment IDs grow with each comment on a site, so the highest is the latest.
		if ( ! kept || comment.commentId > kept.commentId ) {
			byPost.set( comment.key, comment );
		}
	}
	return [ ...byPost.values() ];
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
			groupByPost(
				data?.pages.flatMap( ( page ) =>
					adaptPage( page.comments, adaptReadConversationOwnComment )
				) ?? []
			),
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
		onError: () =>
			dispatch(
				errorNotice( translate( 'Couldn’t mark as read. Try again.' ), {
					id: 'reader-conversations-mark-read-error',
				} )
			),
	} );
}

export function useUnfollowConversation() {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const translate = useTranslate();

	return useMutation( {
		...unfollowReadConversationMutation( queryClient ),
		// onSettled, so the factory keeps its onSuccess. Notices live here rather than in mutate(),
		// which drops its callbacks on unmount or once another unfollow starts.
		onSettled: ( _response, error, { blogId, postId } ) => {
			if ( error ) {
				dispatch(
					errorNotice(
						translate( 'Sorry, we had a problem unfollowing that conversation. Please try again.' )
					)
				);
				return;
			}
			// Following in this session, or loading a followed post, sets a Redux status the post menu
			// reads first. Not following removes it, so the menu goes back to the list, which the
			// factory already updated.
			dispatch(
				updateConversationFollowStatus( {
					siteId: blogId,
					postId,
					followStatus: CONVERSATION_FOLLOW_STATUS.not_following,
				} )
			);
			dispatch(
				successNotice( translate( 'The conversation has been successfully unfollowed.' ), {
					duration: 5000,
				} )
			);
		},
	} );
}
