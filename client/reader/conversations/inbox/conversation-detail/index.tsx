import {
	Button,
	Notice,
	Spinner,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Comments from 'calypso/blocks/comments';
import { COMMENTS_FILTER_ALL } from 'calypso/blocks/comments/comments-filters';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useComments } from 'calypso/reader/data/comments';
import { usePost } from 'calypso/reader/data/post';
import { getPostUrl } from 'calypso/reader/route';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import type { Conversation } from '../group-notes';

import './style.scss';

const WELCOME_DISMISSED_PREFERENCE_KEY = 'reader_conversations_inbox_welcome_dismissed';

interface Props {
	siteId: number;
	postId: number;
	conversation?: Conversation;
	onPrevious?: () => void;
	onNext?: () => void;
}

export function ConversationDetail( { siteId, postId, conversation, onPrevious, onNext }: Props ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();
	const { data: post, isLoading } = usePost( { blogId: siteId, postId } );
	const currentUserId = useSelector( getCurrentUserId );
	const { comments } = useComments( { siteId, postId }, { enabled: !! post && ! post.is_error } );
	const hasCommented =
		!! currentUserId && comments.some( ( comment ) => comment.author?.ID === currentUserId );
	const showWelcome = useSelector(
		( state ) =>
			hasReceivedRemotePreferences( state ) &&
			! getPreference( state, WELCOME_DISMISSED_PREFERENCE_KEY )
	);

	const commentCount = Number(
		( post?.discussion as { comment_count?: number } )?.comment_count ?? 0
	);
	const author = post?.author as { ID?: number; name?: string } | undefined;
	const image =
		( post?.canonical_image as { uri?: string } | undefined )?.uri ??
		( post?.featured_image as string | undefined );
	const date = post?.date ? moment( String( post.date ) ) : null;

	let title = translate( 'You follow this' );
	if ( currentUserId && author?.ID === currentUserId ) {
		title = translate( 'Your post' );
	} else if ( hasCommented ) {
		title = translate( 'You commented' );
	}

	return (
		<VStack spacing={ 0 } className="conversations-inbox__detail-pane">
			<HStack as="header" expanded={ false } className="conversations-inbox__detail-header">
				<Heading level={ 2 } size={ 20 } weight={ 500 } color="inherit">
					{ title }
				</Heading>
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
					{ isLoading && ! post && <Spinner /> }
					{ post && ! post.is_error && (
						<>
							<HStack
								as="a"
								spacing={ 6 }
								alignment="top"
								className="conversations-inbox__post-card"
								href={ getPostUrl( post ) }
							>
								<VStack spacing={ 3 } className="conversations-inbox__post-text">
									<HStack
										as="span"
										justify="flex-start"
										wrap
										className="conversations-inbox__post-meta"
									>
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
										{ date && (
											<span>
												·{ ' ' }
												{ date.isSame( moment(), 'day' )
													? translate( 'Today' )
													: date.format( 'll' ) }
											</span>
										) }
									</HStack>
									<Heading
										level={ 3 }
										size={ 20 }
										weight={ 500 }
										color="inherit"
										isBlock={ false }
										truncate
										numberOfLines={ 2 }
									>
										{ String( post.title ?? conversation?.title ?? '' ) }
									</Heading>
									<Text truncate numberOfLines={ 2 } color="var(--color-text-subtle)">
										{ String( post.better_excerpt_no_html ?? post.excerpt_no_html ?? '' ) }
									</Text>
								</VStack>
								{ image && (
									<img
										className="conversations-inbox__post-image"
										src={ image }
										alt=""
										width={ 120 }
										height={ 120 }
									/>
								) }
							</HStack>

							<Comments
								key={ `${ siteId }-${ postId }` }
								useBlockEditor
								showNestingReplyArrow
								post={ post }
								initialSize={ commentCount || 10 }
								pageSize={ 25 }
								startingCommentId={ conversation?.latestCommentId }
								commentCount={ commentCount }
								maxDepth={ 1 }
								commentsFilterDisplay={ COMMENTS_FILTER_ALL }
								shouldHighlightNew
							/>
						</>
					) }
				</VStack>
			</div>
		</VStack>
	);
}
