/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import classNames from 'classnames';
import { get, startsWith, pickBy } from 'lodash';
import config from 'calypso/config';

/**
 * Internal dependencies
 */
import AutoDirection from 'calypso/components/auto-direction';
import ReaderMain from 'calypso/reader/components/reader-main';
import EmbedContainer from 'calypso/components/embed-container';
import PostExcerpt from 'calypso/components/post-excerpt';
import { markPostSeen } from 'calypso/state/reader/posts/actions';
import ReaderFullPostHeader from './header';
import AuthorCompactProfile from 'calypso/blocks/author-compact-profile';
import LikeButton from 'calypso/reader/like-button';
import { isDiscoverPost, isDiscoverSitePick } from 'calypso/reader/discover/helper';
import DiscoverSiteAttribution from 'calypso/reader/discover/site-attribution';
import DailyPostButton from 'calypso/blocks/daily-post-button';
import { isDailyPostChallengeOrPrompt } from 'calypso/blocks/daily-post-button/helper';
import { shouldShowLikes } from 'calypso/reader/like-helper';
import { shouldShowComments } from 'calypso/blocks/comments/helper';
import CommentButton from 'calypso/blocks/comment-button';
import {
	recordAction,
	recordGaEvent,
	recordTrackForPost,
	recordPermalinkClick,
} from 'calypso/reader/stats';
import Comments from 'calypso/blocks/comments';
import scrollTo from 'calypso/lib/scroll-to';
import PostExcerptLink from 'calypso/reader/post-excerpt-link';
import { getSiteName } from 'calypso/reader/get-helpers';
import KeyboardShortcuts from 'calypso/lib/keyboard-shortcuts';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import {
	RelatedPostsFromSameSite,
	RelatedPostsFromOtherSites,
} from 'calypso/components/related-posts';
import { getStreamUrlFromPost } from 'calypso/reader/route';
import { like as likePost, unlike as unlikePost } from 'calypso/state/posts/likes/actions';
import FeaturedImage from 'calypso/blocks/reader-full-post/featured-image';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { getSite } from 'calypso/state/reader/sites/selectors';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import QueryReaderPost from 'calypso/components/data/query-reader-post';
import ExternalLink from 'calypso/components/external-link';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderFullPostUnavailable from './unavailable';
import BackButton from 'calypso/components/back-button';
import { isFeaturedImageInContent } from 'calypso/lib/post-normalizer/utils';
import ReaderFullPostContentPlaceholder from './placeholders/content';
import { keyForPost } from 'calypso/reader/post-key';
import { showSelectedPost } from 'calypso/reader/utils';
import Emojify from 'calypso/components/emojify';
import { COMMENTS_FILTER_ALL } from 'calypso/blocks/comments/comments-filters';
import { READER_FULL_POST } from 'calypso/reader/follow-sources';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { isLikedPost } from 'calypso/state/posts/selectors/is-liked-post';
import QueryPostLikes from 'calypso/components/data/query-post-likes';
import getCurrentStream from 'calypso/state/selectors/get-reader-current-stream';
import {
	setViewingFullPostKey,
	unsetViewingFullPostKey,
} from 'calypso/state/reader/viewing/actions';
import { getNextItem, getPreviousItem } from 'calypso/state/reader/streams/selectors';
import {
	requestMarkAsSeen,
	requestMarkAsUnseen,
	requestMarkAsSeenBlog,
	requestMarkAsUnseenBlog,
} from 'calypso/state/reader/seen-posts/actions';
import Gridicon from 'calypso/components/gridicon';
import { PerformanceTrackerStop } from 'calypso/lib/performance-tracking';

/**
 * Style dependencies
 */
import './style.scss';

export class FullPostView extends React.Component {
	static propTypes = {
		post: PropTypes.object,
		onClose: PropTypes.func.isRequired,
		referralPost: PropTypes.object,
		referralStream: PropTypes.string,
	};

	hasScrolledToCommentAnchor = false;
	commentsWrapper = React.createRef();

	componentDidMount() {
		KeyboardShortcuts.on( 'close-full-post', this.handleBack );
		KeyboardShortcuts.on( 'like-selection', this.handleLike );
		KeyboardShortcuts.on( 'move-selection-down', this.goToNextPost );
		KeyboardShortcuts.on( 'move-selection-up', this.goToPreviousPost );

		// Send page view
		this.hasSentPageView = false;
		this.hasLoaded = false;
		this.attemptToSendPageView();

		this.checkForCommentAnchor();

		// If we have a comment anchor, scroll to comments
		if ( this.hasCommentAnchor && ! this.hasScrolledToCommentAnchor ) {
			this.scrollToComments();
		}
	}

	componentDidUpdate( prevProps ) {
		// Send page view if applicable
		if (
			get( prevProps, 'post.ID' ) !== get( this.props, 'post.ID' ) ||
			get( prevProps, 'feed.ID' ) !== get( this.props, 'feed.ID' ) ||
			get( prevProps, 'site.ID' ) !== get( this.props, 'site.ID' )
		) {
			this.hasSentPageView = false;
			this.hasLoaded = false;
			this.attemptToSendPageView();
		}

		if ( this.props.shouldShowComments && ! prevProps.shouldShowComments ) {
			this.hasScrolledToCommentAnchor = false;
		}

		this.checkForCommentAnchor();

		// If we have a comment anchor, scroll to comments
		if ( this.hasCommentAnchor && ! this.hasScrolledToCommentAnchor ) {
			this.scrollToComments();
		}
	}

	componentWillUnmount() {
		this.props.unsetViewingFullPostKey( keyForPost( this.props.post ) );
		KeyboardShortcuts.off( 'close-full-post', this.handleBack );
		KeyboardShortcuts.off( 'like-selection', this.handleLike );
		KeyboardShortcuts.off( 'move-selection-down', this.goToNextPost );
		KeyboardShortcuts.off( 'move-selection-up', this.goToPreviousPost );
	}

	handleBack = ( event ) => {
		event.preventDefault();
		recordAction( 'full_post_close' );
		recordGaEvent( 'Closed Full Post Dialog' );
		recordTrackForPost( 'calypso_reader_article_closed', this.props.post );

		this.props.onClose && this.props.onClose();
	};

	handleCommentClick = () => {
		recordAction( 'click_comments' );
		recordGaEvent( 'Clicked Post Comment Button' );
		recordTrackForPost( 'calypso_reader_full_post_comments_button_clicked', this.props.post );
		this.scrollToComments();
	};

	handleLike = () => {
		// cannot like posts backed by rss feeds
		if ( ! this.props.post || this.props.post.is_external ) {
			return;
		}

		const { site_ID: siteId, ID: postId } = this.props.post;
		let liked = this.props.liked;

		if ( liked ) {
			this.props.unlikePost( siteId, postId, { source: 'reader' } );
			liked = false;
		} else {
			this.props.likePost( siteId, postId, { source: 'reader' } );
			liked = true;
		}

		recordAction( liked ? 'liked_post' : 'unliked_post' );
		recordGaEvent( liked ? 'Clicked Like Post' : 'Clicked Unlike Post' );
		recordTrackForPost(
			liked ? 'calypso_reader_article_liked' : 'calypso_reader_article_unliked',
			this.props.post,
			{ context: 'full-post', event_source: 'keyboard' }
		);
	};

	handleRelatedPostFromSameSiteClicked = () => {
		recordTrackForPost( 'calypso_reader_related_post_from_same_site_clicked', this.props.post );
	};

	handleVisitSiteClick = () => {
		recordPermalinkClick( 'full_post_visit_link', this.props.post );
	};

	handleRelatedPostFromOtherSiteClicked = () => {
		recordTrackForPost( 'calypso_reader_related_post_from_other_site_clicked', this.props.post );
	};

	// Does the URL contain the anchor #comments?
	checkForCommentAnchor = () => {
		const hash = window.location.hash.substr( 1 );
		if ( hash.indexOf( 'comments' ) > -1 ) {
			this.hasCommentAnchor = true;
		}
	};

	/**
	 * @returns {number} - the commentId in the url of the form #comment-${id}
	 */
	getCommentIdFromUrl = () =>
		startsWith( window.location.hash, '#comment-' )
			? +window.location.hash.split( '-' )[ 1 ]
			: undefined;

	// Scroll to the top of the comments section.
	scrollToComments = () => {
		if ( ! this.props.post ) {
			return;
		}
		if ( this.props.post._state ) {
			return;
		}
		if ( this._scrolling ) {
			return;
		}

		this._scrolling = true;
		setTimeout( () => {
			const commentsNode = this.commentsWrapper.current;
			if ( commentsNode && commentsNode.offsetTop ) {
				scrollTo( {
					x: 0,
					y: commentsNode.offsetTop - 48,
					duration: 300,
					onComplete: () => {
						// check to see if the comment node moved while we were scrolling
						// and scroll to the end position
						const commentsNodeAfterScroll = this.commentsWrapper.current;
						if ( commentsNodeAfterScroll && commentsNodeAfterScroll.offsetTop ) {
							window.scrollTo( 0, commentsNodeAfterScroll.offsetTop - 48 );
						}
						this._scrolling = false;
					},
				} );
				if ( this.hasCommentAnchor ) {
					this.hasScrolledToCommentAnchor = true;
				}
			}
		}, 0 );
	};

	attemptToSendPageView = () => {
		const { post, site } = this.props;

		if (
			post &&
			post._state !== 'pending' &&
			site &&
			site.ID &&
			! site.is_error &&
			! this.hasSentPageView
		) {
			this.props.markPostSeen( post, site );
			this.hasSentPageView = true;

			// mark post as currently viewing
			this.props.setViewingFullPostKey( keyForPost( post ) );
		}

		if ( ! this.hasLoaded && post && post._state !== 'pending' ) {
			config.isEnabled( 'reader/seen-posts' ) && this.markAsSeen();

			recordTrackForPost(
				'calypso_reader_article_opened',
				post,
				{},
				{
					pathnameOverride: this.props.referralStream,
				}
			);
			this.hasLoaded = true;
		}
	};

	goToNextPost = () => {
		if ( this.props.nextPost ) {
			showSelectedPost( { postKey: this.props.nextPost } );
		}
	};

	goToPreviousPost = () => {
		if ( this.props.previousPost ) {
			showSelectedPost( { postKey: this.props.previousPost } );
		}
	};

	markAsSeen = () => {
		const { post } = this.props;

		if ( post.feed_item_ID ) {
			// is feed
			this.props.requestMarkAsSeen( {
				feedId: post.feed_ID,
				feedUrl: post.feed_URL,
				feedItemIds: [ post.feed_item_ID ],
				globalIds: [ post.global_ID ],
			} );
		} else {
			// is blog
			this.props.requestMarkAsSeenBlog( {
				feedId: post.feed_ID,
				feedUrl: post.feed_URL,
				blogId: post.site_ID,
				postIds: [ post.ID ],
				globalIds: [ post.global_ID ],
			} );
		}
	};

	markAsUnseen = () => {
		const { post } = this.props;
		if ( post.feed_item_ID ) {
			// is feed
			this.props.requestMarkAsUnseen( {
				feedId: post.feed_ID,
				feedUrl: post.feed_URL,
				feedItemIds: [ post.feed_item_ID ],
				globalIds: [ post.global_ID ],
			} );
		} else {
			// is blog
			this.props.requestMarkAsUnseenBlog( {
				feedId: post.feed_ID,
				feedUrl: post.feed_URL,
				blogId: post.site_ID,
				postIds: [ post.ID ],
				globalIds: [ post.global_ID ],
			} );
		}
	};

	renderMarkAsSenButton = () => {
		const { post } = this.props;
		return (
			<div
				className="reader-full-post__seen-button"
				title={ post.is_seen ? 'Mark post as unseen' : 'Mark post as seen' }
			>
				<Gridicon
					icon={ post.is_seen ? 'not-visible' : 'visible' }
					size={ 18 }
					onClick={ post.is_seen ? this.markAsUnseen : this.markAsSeen }
					ref={ this.seenTooltipContextRef }
				/>
			</div>
		);
	};

	render() {
		const { post, site, feed, referralPost, referral, blogId, feedId, postId } = this.props;

		if ( post.is_error ) {
			return <ReaderFullPostUnavailable post={ post } onBackClick={ this.handleBack } />;
		}

		const siteName = getSiteName( { site, post } );
		const classes = { 'reader-full-post': true };
		const showRelatedPosts = post && ! post.is_external && post.site_ID;
		const relatedPostsFromOtherSitesTitle = translate(
			'More on {{wpLink}}WordPress.com{{/wpLink}}',
			{
				components: {
					/* eslint-disable */
					wpLink: <a href="/read" className="reader-related-card__link" />,
					/* eslint-enable */
				},
			}
		);

		if ( post.site_ID ) {
			classes[ 'blog-' + post.site_ID ] = true;
		}
		if ( post.feed_ID ) {
			classes[ 'feed-' + post.feed_ID ] = true;
		}

		const externalHref = isDiscoverPost( referralPost ) ? referralPost.URL : post.URL;
		const isLoading = ! post || post._state === 'pending' || post._state === 'minimal';
		const startingCommentId = this.getCommentIdFromUrl();
		const commentCount = get( post, 'discussion.comment_count' );
		const postKey = { blogId, feedId, postId };

		/*eslint-disable react/no-danger */
		/*eslint-disable react/jsx-no-target-blank */
		return (
			<ReaderMain className={ classNames( classes ) }>
				{ site && <QueryPostLikes siteId={ post.site_ID } postId={ post.ID } /> }
				{ ! post || post._state === 'pending' ? (
					<DocumentHead title={ translate( 'Loading' ) } />
				) : (
					<DocumentHead title={ `${ post.title } ‹ ${ siteName } ‹ Reader` } />
				) }
				{ post && post.feed_ID && <QueryReaderFeed feedId={ +post.feed_ID } /> }
				{ post && ! post.is_external && post.site_ID && (
					<QueryReaderSite siteId={ +post.site_ID } />
				) }
				{ referral && ! referralPost && <QueryReaderPost postKey={ referral } /> }
				{ ! post || ( isLoading && <QueryReaderPost postKey={ postKey } /> ) }
				<BackButton onClick={ this.handleBack } />
				<div className="reader-full-post__visit-site-container">
					<ExternalLink
						icon
						href={ externalHref }
						onClick={ this.handleVisitSiteClick }
						target="_blank"
					>
						<span className="reader-full-post__visit-site-label">
							{ translate( 'Visit Site' ) }
						</span>
					</ExternalLink>
				</div>
				<div className="reader-full-post__content">
					<div className="reader-full-post__sidebar">
						{ isLoading && <AuthorCompactProfile author={ null } /> }
						{ ! isLoading && post.author && (
							<AuthorCompactProfile
								author={ post.author }
								siteIcon={ get( site, 'icon.img' ) }
								feedIcon={ get( feed, 'image' ) }
								siteName={ siteName }
								siteUrl={ post.site_URL }
								feedUrl={ get( feed, 'feed_URL' ) }
								followCount={ site && site.subscribers_count }
								feedId={ +post.feed_ID }
								siteId={ +post.site_ID }
								post={ post }
							/>
						) }
						<div className="reader-full-post__sidebar-comment-like">
							{ shouldShowComments( post ) && (
								<CommentButton
									key="comment-button"
									commentCount={ commentCount }
									onClick={ this.handleCommentClick }
									tagName="div"
								/>
							) }

							{ shouldShowLikes( post ) && (
								<LikeButton
									siteId={ +post.site_ID }
									postId={ +post.ID }
									fullPost
									tagName="div"
									likeSource={ 'reader' }
								/>
							) }

							{ config.isEnabled( 'reader/seen-posts' ) && this.renderMarkAsSenButton() }
						</div>
					</div>
					<Emojify>
						<article className="reader-full-post__story">
							<ReaderFullPostHeader post={ post } referralPost={ referralPost } />

							{ post.featured_image && ! isFeaturedImageInContent( post ) && (
								<FeaturedImage src={ post.featured_image } />
							) }
							{ isLoading && <ReaderFullPostContentPlaceholder /> }
							{ post.use_excerpt ? (
								<PostExcerpt content={ post.better_excerpt ? post.better_excerpt : post.excerpt } />
							) : (
								<EmbedContainer>
									<AutoDirection>
										<div
											className="reader-full-post__story-content"
											dangerouslySetInnerHTML={ { __html: post.content } }
										/>
									</AutoDirection>
								</EmbedContainer>
							) }

							{ post.use_excerpt && ! isDiscoverPost( post ) && (
								<PostExcerptLink siteName={ siteName } postUrl={ post.URL } />
							) }
							{ isDiscoverSitePick( post ) && <DiscoverSiteAttribution post={ post } /> }
							{ isDailyPostChallengeOrPrompt( post ) && (
								<DailyPostButton post={ post } site={ site } />
							) }

							<ReaderPostActions
								post={ post }
								site={ site }
								onCommentClick={ this.handleCommentClick }
								fullPost
							/>

							{ ! isLoading && <PerformanceTrackerStop /> }

							{ showRelatedPosts && (
								<RelatedPostsFromSameSite
									siteId={ +post.site_ID }
									postId={ +post.ID }
									title={ translate( 'More in {{ siteLink /}}', {
										components: {
											siteLink: (
												<a
													href={ getStreamUrlFromPost( post ) }
													/* eslint-disable wpcalypso/jsx-classname-namespace */
													className="reader-related-card__link"
													/* eslint-enable wpcalypso/jsx-classname-namespace */
												>
													{ siteName }
												</a>
											),
										},
									} ) }
									/* eslint-disable wpcalypso/jsx-classname-namespace */
									className="is-same-site"
									/* eslint-enable wpcalypso/jsx-classname-namespace */
									onPostClick={ this.handleRelatedPostFromSameSiteClicked }
								/>
							) }

							<div className="reader-full-post__comments-wrapper" ref={ this.commentsWrapper }>
								{ shouldShowComments( post ) && (
									<Comments
										showNestingReplyArrow
										post={ post }
										initialSize={ startingCommentId ? commentCount : 10 }
										pageSize={ 25 }
										startingCommentId={ startingCommentId }
										commentCount={ commentCount }
										maxDepth={ 1 }
										commentsFilterDisplay={ COMMENTS_FILTER_ALL }
										showConversationFollowButton
										followSource={ READER_FULL_POST }
										shouldPollForNewComments={ config.isEnabled( 'reader/comment-polling' ) }
										shouldHighlightNew
									/>
								) }
							</div>

							{ showRelatedPosts && (
								<RelatedPostsFromOtherSites
									siteId={ +post.site_ID }
									postId={ +post.ID }
									title={ relatedPostsFromOtherSitesTitle }
									/* eslint-disable wpcalypso/jsx-classname-namespace */
									className="is-other-site"
									/* eslint-enable wpcalypso/jsx-classname-namespace */
									onPostClick={ this.handleRelatedPostFromOtherSiteClicked }
								/>
							) }
						</article>
					</Emojify>
				</div>
			</ReaderMain>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { feedId, blogId, postId } = ownProps;
		const postKey = pickBy( { feedId: +feedId, blogId: +blogId, postId: +postId } );
		const post = getPostByKey( state, postKey ) || { _state: 'pending' };

		const { site_ID: siteId, is_external: isExternal } = post;

		const props = {
			post,
			liked: isLikedPost( state, siteId, post.ID ),
			postKey,
		};

		if ( ! isExternal && siteId ) {
			props.site = getSite( state, siteId );
		}
		if ( feedId ) {
			props.feed = getFeed( state, feedId );
		}
		if ( ownProps.referral ) {
			props.referralPost = getPostByKey( state, ownProps.referral );
		}

		const currentStreamKey = getCurrentStream( state );
		if ( currentStreamKey ) {
			props.previousPost = getPreviousItem( state, postKey );
			props.nextPost = getNextItem( state, postKey );
		}

		return props;
	},
	{
		markPostSeen,
		setViewingFullPostKey,
		unsetViewingFullPostKey,
		likePost,
		unlikePost,
		requestMarkAsSeen,
		requestMarkAsUnseen,
		requestMarkAsSeenBlog,
		requestMarkAsUnseenBlog,
	}
)( FullPostView );
