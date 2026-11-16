import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	Button,
	DropdownMenu,
	ExternalLink,
	Icon,
	MenuGroup,
	MenuItem,
	Notice,
	VisuallyHidden,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import {
	arrowUpRight,
	chevronDown,
	chevronLeft,
	chevronRight,
	chevronUp,
	moreHorizontal,
} from '@wordpress/icons';
import { useRtl, useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useRef, useState } from 'react';
import Comments from 'calypso/blocks/comments';
import { COMMENTS_FILTER_ALL } from 'calypso/blocks/comments/comments-filters';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	type ConversationPostDetails,
	getConversationKey,
	useUnfollowConversation,
	type Conversation,
} from 'calypso/reader/data/conversations';
import { usePost, type Post } from 'calypso/reader/data/post';
import { isAuthorNameBlocked } from 'calypso/reader/lib/author-name-blocklist';
import { getPostUrl } from 'calypso/reader/route';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { followConversation, muteConversation } from 'calypso/state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import { getReaderConversationFollowStatus } from 'calypso/state/reader/conversations/selectors';
import { ConversationCommentsPlaceholder, ConversationContentPlaceholder } from './placeholder';
import type {
	ReadConversationPostAuthor,
	ReadConversationPostDiscussion,
	ReadConversationReason,
} from '@automattic/api-core';
import type { AppState } from 'calypso/types';

import './style.scss';

const WELCOME_DISMISSED_PREFERENCE_KEY = 'reader_conversations_inbox_welcome_dismissed';

interface Props {
	siteId: number;
	postId: number;
	conversation?: Conversation;
	onBack?: () => void;
	onPrevious?: () => void;
	onNext?: () => void;
	/** Starts the thread at this comment instead of the latest one. */
	startingCommentId?: number;
	highlightedCommentIds?: number[];
}

function getTitle( translate: ReturnType< typeof useTranslate >, reason: ReadConversationReason ) {
	switch ( reason ) {
		case 'reply':
			return translate( 'Replied to you' );
		case 'mention':
			return translate( 'You were mentioned' );
		case 'own_post':
			return translate( 'Your post' );
		case 'commented':
			return translate( 'You commented' );
		default:
			return translate( 'You follow this' );
	}
}

const getPostDetails = ( post: Post ): ConversationPostDetails => ( {
	siteName: String( post.site_name ?? '' ),
	siteIcon: ( post.site_icon as { img?: string } | undefined )?.img ?? null,
	author: ( post.author as ReadConversationPostAuthor | undefined ) ?? null,
	date: post.date ? String( post.date ) : null,
	excerpt: String( post.better_excerpt_no_html ?? post.excerpt_no_html ?? '' ),
	image: ( post.canonical_image as { uri?: string } | undefined )?.uri ?? null,
	discussion: ( post.discussion ?? { comment_count: 0 } ) as ReadConversationPostDiscussion,
} );

export function ConversationDetail( {
	siteId,
	postId,
	conversation,
	onBack,
	onPrevious,
	onNext,
	startingCommentId,
	highlightedCommentIds,
}: Props ) {
	const translate = useTranslate();
	const isRtl = useRtl();
	const backRef = useRef< HTMLButtonElement >( null );
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();
	const listDetails = conversation?.postDetails;
	const { data: fetchedPost, isLoading, isFetching } = usePost( { blogId: siteId, postId } );
	const isPostError = !! fetchedPost?.is_error;
	const details =
		listDetails ?? ( fetchedPost && ! isPostError ? getPostDetails( fetchedPost ) : undefined );
	const postUrl = conversation?.url;
	const post = useMemo(
		() =>
			listDetails && ( ! fetchedPost || isPostError || isFetching )
				? {
						ID: postId,
						site_ID: siteId,
						URL: postUrl,
						discussion: listDetails.discussion,
						sharing_enabled: false,
					}
				: fetchedPost,
		[ fetchedPost, isPostError, isFetching, listDetails, postId, siteId, postUrl ]
	);
	const currentUserId = useSelector( getCurrentUserId );
	const showWelcome = useSelector(
		( state ) =>
			hasReceivedRemotePreferences( state ) &&
			! getPreference( state, WELCOME_DISMISSED_PREFERENCE_KEY )
	);
	const followStatus = useSelector( ( state: AppState ) =>
		getReaderConversationFollowStatus( state, { siteId, postId } )
	);
	// Redux knows only about follows changed or fetched in this session.
	const isFollowing = followStatus
		? followStatus === CONVERSATION_FOLLOW_STATUS.following
		: !! conversation?.isFollowing;
	const isMuted = followStatus === CONVERSATION_FOLLOW_STATUS.muting;
	const anchorKey = `${ getConversationKey( siteId, postId ) }-${ startingCommentId ?? '' }`;
	const anchorId = startingCommentId ?? conversation?.latestCommentId;
	// Keeps the thread anchored when a list refresh brings in a newer latest comment.
	const [ startingComment, setStartingComment ] = useState( { key: anchorKey, id: anchorId } );
	if ( startingComment.key !== anchorKey || ( ! startingComment.id && anchorId ) ) {
		setStartingComment( { key: anchorKey, id: anchorId } );
	}

	const commentCount = details?.discussion.comment_count ?? 0;
	const author = details?.author ?? undefined;
	// ReaderAuthorLink renders nothing for blocked names, so the dot must skip them too.
	const showAuthor = !! author?.name && ! isAuthorNameBlocked( author.name );
	const date = details?.date ? moment( details.date ) : null;
	const siteIcon = details?.siteIcon;
	const siteName = details?.siteName;
	const excerpt = details?.excerpt;
	const image = details?.image;
	const readerPostUrl = getPostUrl( { site_ID: siteId, ID: postId } );

	let title: string;
	if ( conversation ) {
		title = getTitle( translate, conversation.reason );
	} else if ( currentUserId && author?.ID === currentUserId ) {
		title = translate( 'Your post' );
	} else if ( startingCommentId ) {
		// Opened from Your comments before the conversation loaded.
		title = getTitle( translate, 'commented' );
	} else {
		title = translate( 'Conversation' );
	}

	const { mutate: unfollow } = useUnfollowConversation();

	const act = ( event: string, action: typeof followConversation ) => () => {
		dispatch( recordReaderTracksEvent( event, { source: 'post_menu' }, { post } ) );
		dispatch( action( { siteId, postId } ) );
	};

	const controls = [
		{ title: translate( 'View post' ) as string, onClick: () => page( readerPostUrl ) },
		isFollowing
			? {
					title: translate( 'Unfollow conversation' ) as string,
					onClick: () => {
						dispatch(
							recordReaderTracksEvent(
								'calypso_reader_conversations_inbox_conversation_unfollowed',
								{ source: 'post_menu' },
								{ post }
							)
						);
						unfollow( { blogId: siteId, postId } );
					},
				}
			: {
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
							size="compact"
							className="conversations-inbox__back"
							icon={ isRtl ? chevronRight : chevronLeft }
							onClick={ onBack }
						>
							{ translate( 'Conversations' ) }
						</Button>
					) }
					{ /* Next to the back button the title reads as a second label, so only screen readers get it. */ }
					{ onBack ? (
						<VisuallyHidden as="h2">{ title }</VisuallyHidden>
					) : (
						<Heading level={ 2 } size={ 15 } lineHeight="20px" weight={ 600 } color="inherit">
							{ title }
						</Heading>
					) }
				</HStack>
				<HStack spacing={ 1 } expanded={ false }>
					<Button
						__next40pxDefaultSize
						size="compact"
						className="conversations-inbox__previous"
						icon={ chevronUp }
						label={ translate( 'Previous conversation' ) }
						disabled={ ! onPrevious }
						onClick={ onPrevious }
					/>
					<Button
						__next40pxDefaultSize
						size="compact"
						className="conversations-inbox__next"
						icon={ chevronDown }
						label={ translate( 'Next conversation' ) }
						disabled={ ! onNext }
						onClick={ onNext }
					/>
				</HStack>
			</HStack>
			<div className="conversations-inbox__detail-body">
				{ /* Keyed so the card and comments mount, and fade in, for each conversation. */ }
				<VStack
					key={ getConversationKey( siteId, postId ) }
					spacing={ 8 }
					className="conversations-inbox__detail-content"
				>
					{ showWelcome && (
						<Notice
							status="info"
							className="conversations-inbox__welcome"
							onRemove={ () =>
								dispatch( savePreference( WELCOME_DISMISSED_PREFERENCE_KEY, true ) )
							}
						>
							<VStack spacing={ 1 }>
								<strong>{ translate( 'Welcome to Conversations' ) }</strong>
								<span>
									{ translate(
										'Posts you’ve written, followed, or commented on appear here when they receive new comments, with the latest activity first.'
									) }
								</span>
							</VStack>
						</Notice>
					) }
					{ isLoading && ! post && <ConversationContentPlaceholder /> }
					{ isPostError && ! listDetails && (
						<Text as="p" color="var(--color-text-subtle)">
							{ translate( 'This post can’t be loaded.' ) }{ ' ' }
							{ conversation?.url && (
								<ExternalLink href={ conversation.url }>
									{ translate( 'Open it on the site' ) }
								</ExternalLink>
							) }
						</Text>
					) }
					{ details && post && (
						<>
							<VStack spacing={ 3 } className="conversations-inbox__post-card">
								<HStack
									spacing={ 3 }
									justify="flex-start"
									wrap
									className="conversations-inbox__post-meta"
								>
									<HStack expanded={ false }>
										{ !! siteIcon && <img src={ siteIcon } alt="" width={ 28 } height={ 28 } /> }
										<strong>{ siteName }</strong>
									</HStack>
									<HStack spacing={ 1.5 } expanded={ false }>
										{ showAuthor && author && (
											<ReaderAuthorLink
												author={ author }
												className="conversations-inbox__post-author"
											>
												{ author.name }
											</ReaderAuthorLink>
										) }
										{ showAuthor && date && (
											<span className="conversations-inbox__post-dot" aria-hidden="true" />
										) }
										{ date && (
											<span>
												{ date.isSame( moment(), 'day' )
													? translate( 'Today' )
													: date.format( 'll' ) }
											</span>
										) }
									</HStack>
									<HStack
										spacing={ 4 }
										expanded={ false }
										className="conversations-inbox__post-actions"
									>
										<Icon
											className="conversations-inbox__post-arrow"
											icon={ arrowUpRight }
											size={ 20 }
										/>
										<DropdownMenu
											icon={ moreHorizontal }
											label={ translate( 'Post actions' ) }
											className="conversations-inbox__post-menu"
											toggleProps={ { __next40pxDefaultSize: true, size: 'small' } }
											disableOpenOnArrowDown
											popoverProps={ { placement: 'bottom-end' } }
										>
											{ ( { onClose } ) => (
												<MenuGroup>
													{ controls.map( ( { title: label, onClick } ) => (
														<MenuItem
															key={ label }
															onClick={ () => {
																onClick();
																onClose();
															} }
														>
															{ label }
														</MenuItem>
													) ) }
												</MenuGroup>
											) }
										</DropdownMenu>
									</HStack>
								</HStack>
								<HStack spacing={ 6 } alignment="top">
									<VStack
										as="a"
										spacing={ 2 }
										className="conversations-inbox__post-link"
										href={ readerPostUrl }
									>
										<Heading
											level={ 3 }
											size={ 18 }
											lineHeight="24px"
											weight={ 600 }
											color="inherit"
											isBlock={ false }
											truncate
											numberOfLines={ 1 }
										>
											{ String( fetchedPost?.title ?? conversation?.title ?? '' ) }
										</Heading>
										<Text
											size={ 14 }
											lineHeight="20px"
											truncate
											numberOfLines={ 2 }
											color="color-mix(in srgb, var(--color-text-subtle) 80%, var(--color-text))"
										>
											{ excerpt }
										</Text>
									</VStack>
									{ image && (
										<img
											className="conversations-inbox__post-image"
											src={ image }
											alt=""
											width={ 108 }
											height={ 72 }
										/>
									) }
								</HStack>
							</VStack>

							<Comments
								key={ startingComment.key }
								loadingPlaceholder={ <ConversationCommentsPlaceholder /> }
								useBlockEditor
								showNestingReplyArrow
								post={ post }
								initialSize={ commentCount || 10 }
								pageSize={ 25 }
								startingCommentId={ startingComment.id }
								latestCommentId={ conversation?.latestCommentId }
								commentCount={ commentCount }
								maxDepth={ 1 }
								commentsFilterDisplay={ COMMENTS_FILTER_ALL }
								shouldHighlightNew
								shouldPollForNewComments={ config.isEnabled( 'reader/comment-polling' ) }
								deferNewComments
								highlightedCommentIds={ highlightedCommentIds }
								collapsibleThreads
								spellOutLabels
							/>
						</>
					) }
				</VStack>
			</div>
		</VStack>
	);
}
