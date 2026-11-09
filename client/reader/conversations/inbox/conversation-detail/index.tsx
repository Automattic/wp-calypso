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
	Spinner,
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
import { useEffect, useRef, useState } from 'react';
import Comments from 'calypso/blocks/comments';
import { COMMENTS_FILTER_ALL } from 'calypso/blocks/comments/comments-filters';
import ReaderAuthorLink, { type ReaderLinkAuthor } from 'calypso/blocks/reader-author-link';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	getConversationKey,
	useUnfollowConversation,
	type Conversation,
} from 'calypso/reader/data/conversations';
import { usePost } from 'calypso/reader/data/post';
import { getPostUrl } from 'calypso/reader/route';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { followConversation, muteConversation } from 'calypso/state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import { getReaderConversationFollowStatus } from 'calypso/state/reader/conversations/selectors';
import type { ReadConversationReason } from '@automattic/api-core';
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
	const { data: post, isLoading } = usePost( { blogId: siteId, postId } );
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

	const commentCount = Number(
		( post?.discussion as { comment_count?: number } )?.comment_count ?? 0
	);
	const author = post?.author as ReaderLinkAuthor | undefined;
	const image = ( post?.canonical_image as { uri?: string } | undefined )?.uri;
	const date = post?.date ? moment( String( post.date ) ) : null;
	const postUrl = post ? getPostUrl( post ) : '';

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
		{ title: translate( 'View post' ) as string, onClick: () => page( postUrl ) },
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
				{ isLoading && ! post && (
					<div className="conversations-inbox__detail-loading">
						<Spinner />
					</div>
				) }
				<VStack spacing={ 8 } className="conversations-inbox__detail-content">
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
											width={ 28 }
											height={ 28 }
										/>
									) }
									<strong>{ String( post.site_name ?? '' ) }</strong>
									{ author?.name && (
										<ReaderAuthorLink
											author={ author }
											className="conversations-inbox__post-author"
										>
											{ author.name }
										</ReaderAuthorLink>
									) }
									{ date && (
										<span>
											·{ ' ' }
											{ date.isSame( moment(), 'day' )
												? translate( 'Today' )
												: date.format( 'll' ) }
										</span>
									) }
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
													{ controls.map( ( { title, onClick } ) => (
														<MenuItem
															key={ title }
															onClick={ () => {
																onClick();
																onClose();
															} }
														>
															{ title }
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
										href={ postUrl }
									>
										<Heading
											level={ 3 }
											size={ 18 }
											lineHeight="24px"
											weight={ 600 }
											color="inherit"
											isBlock={ false }
											truncate
											numberOfLines={ 2 }
										>
											{ String( post.title ?? conversation?.title ?? '' ) }
										</Heading>
										<Text
											size={ 13 }
											lineHeight="20px"
											truncate
											numberOfLines={ 2 }
											color="var(--color-text-subtle)"
										>
											{ String( post.better_excerpt_no_html ?? post.excerpt_no_html ?? '' ) }
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
								spellOutLabels
							/>
						</>
					) }
				</VStack>
			</div>
		</VStack>
	);
}
