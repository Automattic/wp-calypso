import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Gridicon, EmbedContainer } from '@automattic/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { get, startsWith, pickBy } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import Comments from 'calypso/blocks/comments';
import { COMMENTS_FILTER_ALL } from 'calypso/blocks/comments/comments-filters';
import { shouldShowComments } from 'calypso/blocks/comments/helper';
import ReaderFeaturedImage from 'calypso/blocks/reader-featured-image';
import { scrollToComments } from 'calypso/blocks/reader-full-post/scroll-to-comments';
import WPiFrameResize from 'calypso/blocks/reader-full-post/wp-iframe-resize';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import TagsList from 'calypso/blocks/reader-post-card/tags-list';
import ReaderSuggestedFollowsDialog from 'calypso/blocks/reader-suggested-follows/dialog';
import AutoDirection from 'calypso/components/auto-direction';
import DocumentHead from 'calypso/components/data/document-head';
import QueryPostLikes from 'calypso/components/data/query-post-likes';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import QueryReaderPost from 'calypso/components/data/query-reader-post';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import PostExcerpt from 'calypso/components/post-excerpt';
import {
	RelatedPostsFromSameSite,
	RelatedPostsFromOtherSites,
} from 'calypso/components/related-posts';
import { isFeaturedImageInContent } from 'calypso/lib/post-normalizer/utils';
import ReaderBackButton from 'calypso/reader/components/back-button';
import ReaderMain from 'calypso/reader/components/reader-main';
import { canBeMarkedAsSeen, getSiteName, isEligibleForUnseen } from 'calypso/reader/get-helpers';
import readerContentWidth from 'calypso/reader/lib/content-width';
import PostExcerptLink from 'calypso/reader/post-excerpt-link';
import { keyForPost } from 'calypso/reader/post-key';
import { ReaderPerformanceTrackerStop } from 'calypso/reader/reader-performance-tracker';
import { getStreamUrlFromPost } from 'calypso/reader/route';
import {
	recordAction,
	recordGaEvent,
	recordTrackForPost,
	recordPermalinkClick,
} from 'calypso/reader/stats';
import { showSelectedPost } from 'calypso/reader/utils';
import { requestPostComments } from 'calypso/state/comments/actions';
import { isCommentsApiDisabled } from 'calypso/state/comments/selectors/get-comments-api-disabled';
import { like as likePost, unlike as unlikePost } from 'calypso/state/posts/likes/actions';
import { isLikedPost } from 'calypso/state/posts/selectors/is-liked-post';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import {
	getReaderFollowForFeed,
	hasReaderFollowOrganization,
} from 'calypso/state/reader/follows/selectors';
import { markPostSeen } from 'calypso/state/reader/posts/actions';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import {
	requestMarkAsSeen,
	requestMarkAsUnseen,
	requestMarkAsSeenBlog,
	requestMarkAsUnseenBlog,
} from 'calypso/state/reader/seen-posts/actions';
import { getSite } from 'calypso/state/reader/sites/selectors';
import { getNextItem, getPreviousItem } from 'calypso/state/reader/streams/selectors';
import {
	setViewingFullPostKey,
	unsetViewingFullPostKey,
} from 'calypso/state/reader/viewing/actions';
import getPreviousPath from 'calypso/state/selectors/get-previous-path';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import getCurrentStream from 'calypso/state/selectors/get-reader-current-stream';
import isFeedWPForTeams from 'calypso/state/selectors/is-feed-wpforteams';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { disableAppBanner, enableAppBanner } from 'calypso/state/ui/actions';
import ReaderFullPostActionBar from './action-bar';
import ContentProcessor from './content-processor';
import ReaderFullPostHeader from './header';
import ReaderFullPostContentPlaceholder from './placeholders/content';
import ScrollTracker from './scroll-tracker';
import ReaderFullPostUnavailable from './unavailable';
import './style.scss';

const inputTags = [ 'INPUT', 'SELECT', 'TEXTAREA' ];

export class FullPostView extends Component {
	static propTypes = {
		post: PropTypes.object,
		onClose: PropTypes.func,
		referralPost: PropTypes.object,
		referralStream: PropTypes.string,
		isWPForTeamsItem: PropTypes.bool,
		hasOrganization: PropTypes.bool,
		layout: PropTypes.oneOf( [ 'default', 'recent' ] ),
		currentPath: PropTypes.string,
		isAutomattician: PropTypes.bool,
		commentsApiDisabled: PropTypes.bool,
	};

	hasScrolledToCommentAnchor = false;
	readerMainWrapper = createRef();
	commentsWrapper = createRef();
	postContentWrapper = createRef();
	mountedPath;

	state = {
		isSuggestedFollowsModalOpen: false,
	};

	openSuggestedFollowsModal = ( followClicked ) => {
		this.setState( { isSuggestedFollowsModalOpen: followClicked } );
	};
	onCloseSuggestedFollowModal = () => {
		this.setState( { isSuggestedFollowsModalOpen: false } );
	};

	componentDidMount() {
		this.scrollTracker = new ScrollTracker();
		// Send page view
		this.hasSentPageView = false;
		this.hasLoaded = false;
		this.setReadingStartTime();
		this.attemptToSendPageView();
		this.maybeDisableAppBanner();
		this.mountedPath = this.props.currentPath;

		this.checkForCommentAnchor();

		// If we have a comment anchor, scroll to comments
		if ( this.hasCommentAnchor && ! this.hasScrolledToCommentAnchor ) {
			this.scrollToComments();
		}

		// Ensure we check comments API availability for this post
		this.checkCommentsApiAvailability();

		// Adds WPiFrameResize listener for setting the corect height in embedded iFrames.
		this.stopResize =
			this.postContentWrapper.current && WPiFrameResize( this.postContentWrapper.current );

		document.querySelector( 'body' ).classList.add( 'is-reader-full-post' );

		document.addEventListener( 'keydown', this.handleKeydown, true );

		document.addEventListener( 'visibilitychange', this.handleVisibilityChange );

		const scrollableContainer = this.findScrollableContainer();
		if ( scrollableContainer ) {
			this.scrollableContainer = scrollableContainer;
			if ( scrollableContainer !== window ) {
				this.scrollTracker.setContainer( scrollableContainer );
			}
			this.resetScroll();
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
			this.maybeDisableAppBanner();

			// If the post being viewed changes, track the reading time.
			if ( get( prevProps, 'post.ID' ) !== get( this.props, 'post.ID' ) ) {
				this.trackReadingTime( prevProps.post );
				this.trackScrollDepth( prevProps.post );
				this.trackExitBeforeCompletion( prevProps.post );
				this.setReadingStartTime();
				this.resetScroll();
			}

			// Check comments API availability when post changes
			this.checkCommentsApiAvailability();
		}

		if ( this.props.shouldShowComments && ! prevProps.shouldShowComments ) {
			this.hasScrolledToCommentAnchor = false;
		}

		this.checkForCommentAnchor();

		// If we have a comment anchor, scroll to comments
		if ( this.hasCommentAnchor && ! this.hasScrolledToCommentAnchor ) {
			this.scrollToComments();
		}

		// Check if we just finished loading the post and enable the app banner when there's no error
		const finishedLoading = prevProps.post?._state === 'pending' && ! this.props.post?._state;
		const isError = this.props.post?.is_error;
		if ( finishedLoading && ! isError ) {
			this.props.enableAppBanner();
		}
	}

	componentWillUnmount() {
		this.props.unsetViewingFullPostKey( keyForPost( this.props.post ) );
		// Remove WPiFrameResize listener.
		this.stopResize?.();
		this.props.enableAppBanner(); // reset the app banner
		document.querySelector( 'body' ).classList.remove( 'is-reader-full-post' );
		this.trackReadingTime();
		document.removeEventListener( 'keydown', this.handleKeydown, true );
		document.removeEventListener( 'visibilitychange', this.handleVisibilityChange );

		// Track scroll depth and remove related instruments
		this.trackScrollDepth( this.props.post );
		this.scrollTracker.cleanup();
		this.clearResetScrollTimeout();
	}

	findScrollableContainer = () => {
		if ( ! this.readerMainWrapper.current ) {
			return null;
		}

		let element = this.readerMainWrapper.current;

		// Traverse up the DOM tree to find the first scrollable container
		while ( element && element !== document.body ) {
			const style = window.getComputedStyle( element );
			const overflowY = style.overflowY || style.overflow;
			const hasScrollableContent = element.scrollHeight > element.clientHeight;

			// Check if element is scrollable
			if (
				overflowY === 'auto' ||
				overflowY === 'scroll' ||
				( hasScrollableContent && element.scrollTop !== undefined )
			) {
				return element;
			}

			element = element.parentElement;
		}

		// Fall back to window if no scrollable container found
		return window;
	};

	setReadingStartTime = () => {
		this.readingStartTime = new Date().getTime();
	};

	handleKeydown = ( event ) => {
		if ( this.props.notificationsOpen ) {
			return;
		}

		const tagName = ( event.target || event.srcElement ).tagName;
		if ( inputTags.includes( tagName ) || event.target.isContentEditable ) {
			return;
		}

		if ( event?.metaKey || event?.ctrlKey ) {
			// avoid conflicting with the command palette shortcut cmd+k
			return;
		}

		switch ( event.keyCode ) {
			// Close full post - Esc
			case 27: {
				return this.handleBack( event );
			}

			// Like post - l
			case 76: {
				return this.handleLike();
			}

			// Next post - j
			case 74: {
				return this.goToPost( this.props.nextPost );
			}

			// Previous post - k
			case 75: {
				return this.goToPost( this.props.previousPost );
			}
		}
	};

	handleVisibilityChange = () => {
		if ( document.hidden ) {
			this.trackReadingTime();
			this.trackScrollDepth();
			this.trackExitBeforeCompletion();
		}
	};

	trackReadingTime( post = null ) {
		if ( ! post ) {
			post = this.props.post;
		}
		if ( this.readingStartTime && post.ID ) {
			const endTime = Math.floor( Date.now() );
			const engagementTime = endTime - this.readingStartTime;
			recordTrackForPost(
				'calypso_reader_article_engaged_time',
				post,
				{
					context: 'full-post',
					engagement_time: engagementTime / 1000,
					path: this.mountedPath,
				},
				{ pathnameOverride: this.mountedPath }
			);
			// check if the user exited early
			this.checkFastExit( post, engagementTime );
		}
	}

	clearResetScrollTimeout = () => {
		if ( this.resetScrollTimeout ) {
			clearTimeout( this.resetScrollTimeout );
			this.resetScrollTimeout = null;
		}
	};

	resetScroll = () => {
		this.clearResetScrollTimeout();
		this.resetScrollTimeout = setTimeout( () => {
			if ( ! this.scrollableContainer ) {
				return;
			}

			if ( this.scrollableContainer === window ) {
				window.scrollTo( {
					top: 0,
					left: 0,
					behavior: 'instant',
				} );
			} else {
				this.scrollableContainer.scrollTo( {
					top: 0,
					left: 0,
					behavior: 'instant',
				} );
			}

			// Only reset scroll depth if we have a container element (not window)
			if ( this.scrollableContainer !== window ) {
				this.scrollTracker.resetMaxScrollDepth();
			}
		}, 0 ); // Defer until after the DOM update
	};

	trackScrollDepth = ( post = null ) => {
		if ( ! post ) {
			post = this.props.post;
		}

		if ( this.scrollableContainer && post.ID ) {
			const maxScrollDepth = this.scrollTracker.getMaxScrollDepthAsPercentage();
			recordTrackForPost(
				'calypso_reader_article_scroll_depth',
				post,
				{
					context: 'full-post',
					scroll_depth: maxScrollDepth,
					path: this.mountedPath,
				},
				{ pathnameOverride: this.mountedPath }
			);
		}
	};

	trackExitBeforeCompletion = ( post = null ) => {
		if ( ! post ) {
			post = this.props.post;
		}

		const maxScrollDepth = this.scrollTracker.getMaxScrollDepthAsPercentage();
		const hasCompleted = maxScrollDepth >= 90; // User has read 90% of the post

		if ( this.scrollableContainer && post.ID && ! hasCompleted ) {
			recordTrackForPost(
				'calypso_reader_article_exit_before_completion',
				post,
				{
					context: 'full-post',
					scroll_depth: maxScrollDepth,
					path: this.mountedPath,
				},
				{ pathnameOverride: this.mountedPath }
			);
		}
	};

	trackFastExit = ( post, elapsedSeconds, fastExitThreshold ) => {
		recordTrackForPost(
			'calypso_reader_article_fast_exit',
			post,
			{
				context: 'full-post',
				estimated_reading_time: post.minutes_to_read,
				elapsed_seconds: elapsedSeconds,
				fast_exit_threshold: fastExitThreshold,
				path: this.mountedPath,
			},
			{ pathnameOverride: this.mountedPath }
		);
	};

	checkFastExit = ( post = null, engagementTime ) => {
		if ( ! post ) {
			post = this.props.post;
		}

		if (
			! this.readingStartTime ||
			! post?.ID ||
			! post?.minutes_to_read ||
			post?.minutes_to_read === 0
		) {
			return;
		}

		const elapsedSeconds = engagementTime / 1000;
		const estimatedSecondsToRead = post.minutes_to_read * 60;
		const fastExitThreshold = estimatedSecondsToRead * 0.25; // Define a "fast exit" as 25% of estimated time

		if ( elapsedSeconds < fastExitThreshold ) {
			this.trackFastExit( post, elapsedSeconds, fastExitThreshold );
		}
	};

	handleBack = ( event ) => {
		event.preventDefault();
		recordAction( 'full_post_close' );
		recordGaEvent( 'Closed Full Post Dialog' );
		recordTrackForPost( 'calypso_reader_article_closed', this.props.post );
		this.props.onClose && this.props.onClose();
		// In recent view the back button appears at smaller viewports to go back to the list of
		// posts (handled with onClose prop) and should not change route.
		if ( this.props.layout !== 'recent' ) {
			page.back( this.props.previousRoute );
		}
	};

	handleCommentClick = () => {
		recordAction( 'click_comments' );
		recordGaEvent( 'Clicked Post Comment Button' );
		recordTrackForPost( 'calypso_reader_full_post_comments_button_clicked', this.props.post );
		this.scrollToComments( { focusTextArea: true } );
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

	onEditClick = () => {
		recordAction( 'edit_post' );
		recordGaEvent( 'Clicked Edit Post', 'full_post' );
		recordTrackForPost( 'calypso_reader_edit_post_clicked', this.props.post );
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
	scrollToComments = ( { focusTextArea = false } = {} ) => {
		if ( ! this.props.post || this.props.post._state || this._scrolling ) {
			return;
		}

		this._scrolling = true;
		scrollToComments( {
			focusTextArea,
			container: this.readerMainWrapper.current,
			onScrollComplete: () => {
				this._scrolling = false;
				if ( this.hasCommentAnchor ) {
					this.hasScrolledToCommentAnchor = true;
				}
			},
		} );
	};

	attemptToSendPageView = () => {
		const { post, site, isWPForTeamsItem, hasOrganization } = this.props;

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
			if (
				isEligibleForUnseen( { isWPForTeamsItem, hasOrganization } ) &&
				canBeMarkedAsSeen( { post } )
			) {
				this.markAsSeen();
			}

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

	maybeDisableAppBanner = () => {
		const { post, site } = this.props;

		// disable the banner while the post is loading and when it failed to load
		const isLoading = post?._state === 'pending';
		const isError = post?.is_error || site?.is_error;
		if ( isLoading || isError ) {
			this.props.disableAppBanner();
		}
	};

	goToPost = ( post ) => {
		const { layout, setSelectedItem, showSelectedPost: showPost } = this.props;
		if ( post ) {
			if ( layout === 'recent' && setSelectedItem ) {
				setSelectedItem( post );
			} else {
				showPost( { postKey: post } );
			}
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

	checkCommentsApiAvailability = () => {
		const { post, commentsApiDisabled } = this.props;

		// Only check if we don't already know the API is disabled
		// and if we have a valid post with a site ID
		if ( ! commentsApiDisabled && post?.site_ID && post?.ID && ! post.is_external ) {
			this.props.requestPostComments( {
				siteId: post.site_ID,
				postId: post.ID,
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
		const {
			post,
			site,
			feed,
			referralPost,
			referral,
			blogId,
			feedId,
			postId,
			hasOrganization,
			isWPForTeamsItem,
			commentsApiDisabled,
		} = this.props;

		if ( post.is_error ) {
			return (
				<ReaderFullPostUnavailable
					post={ post }
					onBackClick={ this.handleBack }
					layout={ this.props.layout }
				/>
			);
		}

		const isDefaultLayout = this.props.layout !== 'recent';
		const siteName = getSiteName( { site, post } );
		const classes = {
			'reader-full-post': true,
			'is-reddit-post': post.is_reddit_post,
		};
		const showRelatedPosts = post && ! post.is_external && post.site_ID && isDefaultLayout;
		const relatedPostsFromOtherSitesTitle = translate(
			'More on {{wpLink}}WordPress.com{{/wpLink}}',
			{
				components: {
					/* eslint-disable */
					wpLink: <a href="/reader" className="reader-related-card__link" />,
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

		const isLoading = ! post || post._state === 'pending' || post._state === 'minimal';
		const startingCommentId = this.getCommentIdFromUrl();
		const commentCount = get( post, 'discussion.comment_count' );
		const postKey = { blogId, feedId, postId };
		const contentWidth = readerContentWidth();
		const feedUrl = get( post, 'feed_URL' );
		const shouldShowMarkAsSeen =
			isEligibleForUnseen( { isWPForTeamsItem, hasOrganization } ) && canBeMarkedAsSeen( { post } );

		/*eslint-disable react/no-danger */
		/*eslint-disable react/jsx-no-target-blank */
		return (
			// add extra div wrapper for consistent content frame layout/styling for reader.
			<div style={ { position: 'relative' } }>
				<ReaderMain className={ clsx( classes ) } forwardRef={ this.readerMainWrapper }>
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
					<ReaderBackButton
						handleBack={ this.handleBack }
						// We will always prevent the back button here from triggering a route
						// change. Since we support 'esc' keyboard shortcut to close full post, we
						// need to trigger that logic from here in handleBack.
						preventRouteChange
						forceShow={ this.props.layout === 'recent' }
						aria-label={ translate( 'Return to the list of posts.' ) }
					/>
					<div className="reader-full-post__content">
						<article className="reader-full-post__story">
							<ReaderFullPostHeader
								post={ post }
								referralPost={ referralPost }
								layout={ this.props.layout }
								author={ post.author }
								siteName={ siteName }
								followCount={ site && site.subscribers_count }
								feedId={ +post.feed_ID }
								siteId={ +post.site_ID }
								tags={ isDefaultLayout ? <TagsList post={ post } tagsToShow={ 5 } /> : null }
							/>

							{ isDefaultLayout && (
								<ReaderFullPostActionBar
									post={ post }
									site={ site }
									commentCount={ commentCount }
									onCommentClick={ this.handleCommentClick }
									onEditClick={ this.onEditClick }
									commentsApiDisabled={ commentsApiDisabled }
									showComments={ shouldShowComments( post ) }
									renderMarkAsSeenButton={
										shouldShowMarkAsSeen ? this.renderMarkAsSenButton : null
									}
									feedUrl={ feedUrl }
									siteUrl={ post.site_URL }
									onFollowToggle={ this.openSuggestedFollowsModal }
								/>
							) }

							{ post.featured_image && ! isFeaturedImageInContent( post ) && (
								<ReaderFeaturedImage
									canonicalMedia={ null }
									imageUrl={ post.featured_image }
									href={ getStreamUrlFromPost( post ) }
									imageWidth={ contentWidth }
									children={ <div style={ { width: contentWidth } } /> }
								/>
							) }
							{ isLoading && <ReaderFullPostContentPlaceholder /> }
							{ post.use_excerpt ? (
								<PostExcerpt content={ post.better_excerpt ? post.better_excerpt : post.excerpt } />
							) : (
								<EmbedContainer>
									<AutoDirection>
										<div
											ref={ this.postContentWrapper }
											className="reader-full-post__story-content-container"
										>
											<ContentProcessor content={ post.content } />
										</div>
									</AutoDirection>
								</EmbedContainer>
							) }

							{ post.use_excerpt && <PostExcerptLink siteName={ siteName } postUrl={ post.URL } /> }

							<ReaderPostActions
								post={ post }
								site={ site }
								onCommentClick={ this.handleCommentClick }
								fullPost
								commentsApiDisabled={ commentsApiDisabled }
							/>

							{ ! isLoading && <ReaderPerformanceTrackerStop /> }

							<div className="reader-full-post__comments-wrapper" ref={ this.commentsWrapper }>
								{ ! commentsApiDisabled && shouldShowComments( post ) && (
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
										shouldPollForNewComments={ config.isEnabled( 'reader/comment-polling' ) }
										shouldHighlightNew
									/>
								) }
							</div>

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
					</div>
					{ post.site_ID && (
						<ReaderSuggestedFollowsDialog
							onClose={ this.onCloseSuggestedFollowModal }
							siteId={ +post.site_ID }
							postId={ +post.ID }
							isVisible={ this.state.isSuggestedFollowsModalOpen }
							prefetch
							author={ feed?.blog_owner }
						/>
					) }
				</ReaderMain>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { feedId, blogId, postId } = ownProps;
		const postKey = pickBy( { feedId: +feedId, blogId: +blogId, postId: +postId } );
		const post = getPostByKey( state, postKey ) || { _state: 'pending' };
		const currentPath = state.route.path.current;

		const { site_ID: siteId, is_external: isExternal } = post;

		const props = {
			isWPForTeamsItem: isSiteWPForTeams( state, blogId ) || isFeedWPForTeams( state, feedId ),
			notificationsOpen: isNotificationsOpen( state ),
			hasOrganization: hasReaderFollowOrganization( state, feedId, blogId ),
			post,
			liked: isLikedPost( state, siteId, post.ID ),
			postKey,
			currentPath,
			referralStream: getPreviousPath( state ),
			previousRoute: getPreviousRoute( state ),
			commentsApiDisabled: isCommentsApiDisabled( state, siteId ),
		};

		if ( ! isExternal && siteId ) {
			props.site = getSite( state, siteId );
		}
		if ( feedId ) {
			props.feed = getFeed( state, feedId );

			// Add site icon to feed object so have icon for external feeds
			if ( props.feed ) {
				const follow = getReaderFollowForFeed( state, parseInt( feedId ) );
				props.feed.site_icon = follow?.site_icon;
			}
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
		disableAppBanner,
		enableAppBanner,
		markPostSeen,
		setViewingFullPostKey,
		unsetViewingFullPostKey,
		likePost,
		unlikePost,
		requestMarkAsSeen,
		requestMarkAsUnseen,
		requestMarkAsSeenBlog,
		requestMarkAsUnseenBlog,
		showSelectedPost,
		requestPostComments,
	}
)( FullPostView );
