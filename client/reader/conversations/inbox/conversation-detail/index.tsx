import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	Button,
	DropdownMenu,
	ExternalLink,
	Spinner,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import {
	chevronDown,
	chevronLeft,
	chevronRight,
	chevronUp,
	moreHorizontal,
} from '@wordpress/icons';
import { useRtl, useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import Comments from 'calypso/blocks/comments';
import { COMMENTS_FILTER_ALL } from 'calypso/blocks/comments/comments-filters';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { usePost } from 'calypso/reader/data/post';
import { getPostUrl } from 'calypso/reader/route';
import { useDispatch, useSelector } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { followConversation, muteConversation } from 'calypso/state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import { getReaderConversationFollowStatus } from 'calypso/state/reader/conversations/selectors';
import type { Conversation } from '../group-notes';
import type { AppState } from 'calypso/types';

import './style.scss';

interface Props {
	siteId: number;
	postId: number;
	conversation?: Conversation;
	onBack?: () => void;
	onPrevious?: () => void;
	onNext?: () => void;
	highlightedCommentIds?: number[];
}

export function ConversationDetail( {
	siteId,
	postId,
	conversation,
	onBack,
	onPrevious,
	onNext,
	highlightedCommentIds,
}: Props ) {
	const translate = useTranslate();
	const isRtl = useRtl();
	const backRef = useRef< HTMLButtonElement >( null );
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();
	const { data: post, isLoading } = usePost( { blogId: siteId, postId } );
	const followStatus = useSelector( ( state: AppState ) =>
		getReaderConversationFollowStatus( state, { siteId, postId } )
	);
	const isFollowing = followStatus === CONVERSATION_FOLLOW_STATUS.following;
	const isMuted = followStatus === CONVERSATION_FOLLOW_STATUS.muting;
	const conversationKey = `${ siteId }-${ postId }`;
	const latestCommentId = conversation?.latestCommentId;
	// Keeps the thread anchored when a list refresh brings in a newer latest comment.
	const [ startingComment, setStartingComment ] = useState( {
		key: conversationKey,
		id: latestCommentId,
	} );
	if ( startingComment.key !== conversationKey || ( ! startingComment.id && latestCommentId ) ) {
		setStartingComment( { key: conversationKey, id: latestCommentId } );
	}

	const commentCount = Number(
		( post?.discussion as { comment_count?: number } )?.comment_count ?? 0
	);
	const author = post?.author as { name?: string } | undefined;
	const postUrl = post ? getPostUrl( post ) : '';

	const act = ( event: string, action: typeof followConversation ) => () => {
		dispatch( recordReaderTracksEvent( event, { source: 'post_menu' }, { post } ) );
		dispatch( action( { siteId, postId } ) );
	};

	const controls = [
		{ title: translate( 'View post' ) as string, onClick: () => page( postUrl ) },
		! isFollowing && {
			title: translate( 'Follow conversation' ) as string,
			onClick: act(
				'calypso_reader_conversations_inbox_conversation_followed',
				followConversation
			),
		},
		! isMuted && {
			title: translate( 'Mute conversation' ) as string,
			onClick: act( 'calypso_reader_conversations_inbox_conversation_muted', muteConversation ),
		},
	].filter( ( control ) => control !== false );

	useEffect( () => {
		backRef.current?.focus();
	}, [] );

	return (
		<VStack spacing={ 0 } className="conversations-inbox__detail-pane">
			<HStack as="header" expanded={ false } className="conversations-inbox__detail-header">
				<HStack justify="flex-start" spacing={ 2 }>
					{ onBack && (
						<Button
							ref={ backRef }
							__next40pxDefaultSize
							icon={ isRtl ? chevronRight : chevronLeft }
							onClick={ onBack }
						>
							{ translate( 'Conversations' ) }
						</Button>
					) }
					<Heading level={ 2 } size={ 20 } weight={ 500 } color="inherit">
						{ translate( 'You follow this' ) }
					</Heading>
				</HStack>
				<HStack spacing={ 0 } expanded={ false }>
					<Button
						__next40pxDefaultSize
						icon={ chevronUp }
						label={ translate( 'Previous conversation' ) }
						disabled={ ! onPrevious }
						onClick={ onPrevious }
					/>
					<Button
						__next40pxDefaultSize
						icon={ chevronDown }
						label={ translate( 'Next conversation' ) }
						disabled={ ! onNext }
						onClick={ onNext }
					/>
				</HStack>
			</HStack>
			<div className="conversations-inbox__detail-body">
				<VStack spacing={ 10 } className="conversations-inbox__detail-content">
					{ isLoading && ! post && <Spinner /> }
					{ !! post?.is_error && (
						<Text as="p" color="var(--color-text-subtle)">
							{ translate( 'This post can’t be loaded.' ) }{ ' ' }
							{ conversation?.url && (
								<ExternalLink href={ conversation.url }>
									{ translate( 'Open it on the site' ) }
								</ExternalLink>
							) }
						</Text>
					) }
					{ post && ! post.is_error && (
						<>
							<VStack spacing={ 3 } className="conversations-inbox__post-card">
								<HStack justify="flex-start" wrap className="conversations-inbox__post-meta">
									{ !! post.site_icon && (
										<img
											src={ ( post.site_icon as { img?: string } )?.img }
											alt=""
											width={ 24 }
											height={ 24 }
										/>
									) }
									<strong>{ String( post.site_name ?? '' ) }</strong>
									{ author?.name && <span>{ author.name }</span> }
									{ !! post.date && (
										<span>· { moment( String( post.date ) ).format( 'll' ) }</span>
									) }
									<DropdownMenu
										icon={ moreHorizontal }
										label={ translate( 'Post actions' ) }
										className="conversations-inbox__post-menu"
										toggleProps={ { __next40pxDefaultSize: true } }
										disableOpenOnArrowDown
										popoverProps={ { placement: 'bottom-end' } }
										controls={ controls }
									/>
								</HStack>
								<VStack
									as="a"
									spacing={ 3 }
									className="conversations-inbox__post-link"
									href={ postUrl }
								>
									<Heading level={ 3 } size={ 20 } weight={ 500 } color="inherit">
										{ String( post.title ?? conversation?.title ?? '' ) }
									</Heading>
									<Text truncate numberOfLines={ 1 } color="var(--color-text-subtle)">
										{ String( post.better_excerpt_no_html ?? post.excerpt_no_html ?? '' ) }
									</Text>
								</VStack>
							</VStack>

							<Comments
								key={ conversationKey }
								useBlockEditor
								showNestingReplyArrow
								post={ post }
								initialSize={ commentCount || 10 }
								pageSize={ 25 }
								startingCommentId={ startingComment.id }
								commentCount={ commentCount }
								maxDepth={ 1 }
								commentsFilterDisplay={ COMMENTS_FILTER_ALL }
								shouldHighlightNew
								shouldPollForNewComments={ config.isEnabled( 'reader/comment-polling' ) }
								deferNewComments
								highlightedCommentIds={ highlightedCommentIds }
								collapsibleThreads
							/>
						</>
					) }
				</VStack>
			</div>
		</VStack>
	);
}
