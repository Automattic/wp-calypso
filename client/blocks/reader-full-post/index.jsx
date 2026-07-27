import './style.scss';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Gridicon, EmbedContainer } from '@automattic/components';
import { isDefaultLocale } from '@automattic/i18n-utils';
import { pickBy } from '@automattic/js-utils';
import clsx from 'clsx';
import { fixMe, translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, Component, useMemo } from 'react';
import { connect } from 'react-redux';
import Comments from 'calypso/blocks/comments';
import { COMMENTS_FILTER_ALL } from 'calypso/blocks/comments/comments-filters';
import ReaderFullPostFeaturedImage from 'calypso/blocks/reader-full-post/featured-image';
import { scrollToComments } from 'calypso/blocks/reader-full-post/scroll-to-comments';
import WPiFrameResize from 'calypso/blocks/reader-full-post/wp-iframe-resize';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import TagsList from 'calypso/blocks/reader-post-card/tags-list';
import ReaderSuggestedFollowsDialog from 'calypso/blocks/reader-suggested-follows/dialog';
import AutoDirection from 'calypso/components/auto-direction';
import DocumentHead from 'calypso/components/data/document-head';
import { withPostLikes } from 'calypso/components/data/post-likes';
import { withReaderTeams } from 'calypso/components/data/with-reader-teams';
import PostExcerpt from 'calypso/components/post-excerpt';
import {
	RelatedPostsFromSameSite,
	RelatedPostsFromOtherSites,
} from 'calypso/components/related-posts';
import { isFeaturedImageInContent } from 'calypso/lib/post-normalizer/utils';
import ReaderBackButton from 'calypso/reader/components/back-button';
import ReaderMain from 'calypso/reader/components/reader-main';
import { usePostCommentsApiDisabled } from 'calypso/reader/data/comments';
import { useFeedQuery } from 'calypso/reader/data/feed';
import { usePost } from 'calypso/reader/data/post';
import { withPostLikeActions } from 'calypso/reader/data/post/likes';
import { withSeenPostsMutations } from 'calypso/reader/data/seen-posts';
import { withSite } from 'calypso/reader/data/site';
import {
	useSiteSubscriptionForFeed,
	useHasSiteSubscriptionOrganization,
} from 'calypso/reader/data/site-subscriptions';
import { canBeMarkedAsSeen, getSiteName, isEligibleForUnseen } from 'calypso/reader/get-helpers';
import readerContentWidth from 'calypso/reader/lib/content-width';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { markPostSeen } from 'calypso/reader/mark-post-seen';
import { isCommentsOpen, isLoginRequiredToComment } from 'calypso/reader/post/capabilities';
import PostExcerptLink from 'calypso/reader/post-excerpt-link';
import { keyForPost } from 'calypso/reader/post-key';
import { ReaderPerformanceTrackerStop } from 'calypso/reader/reader-performance-tracker';
import { getStreamUrlFromPost } from 'calypso/reader/route';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import { useStreamPostKeySelection } from 'calypso/reader/stream/use-stream-post-key-selection';
import { getPostTitleFallback, showSelectedPost } from 'calypso/reader/utils';
import XPostHelper, { isXPost } from 'calypso/reader/xpost-helper';
import { useSelector } from 'calypso/state';
import {
	setViewingFullPostKey,
	unsetViewingFullPostKey,
} from 'calypso/state/reader/viewing/actions';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getPreviousPath from 'calypso/state/selectors/get-previous-path';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import getCurrentStream from 'calypso/state/selectors/get-reader-current-stream';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { disableAppBanner, enableAppBanner } from 'calypso/state/ui/actions';
import ReaderFullPostActionBar from './action-bar';
import ContentProcessor from './content-processor';
import ReaderFullPostHeader from './header';
import ReaderFullPostContentPlaceholder from './placeholders/content';
import ReaderFullPostNavigation from './post-navigation';
import ScrollTracker from './scroll-tracker';
import ReaderFullPostUnavailable from './unavailable';

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
		commentsApiDisabled: PropTypes.bool,
		teams: PropTypes.array,
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
			prevProps?.post?.ID !== this.props?.post?.ID ||
			prevProps?.feed?.ID !== this.props?.feed?.ID ||
			prevProps?.site?.ID !== this.props?.site?.ID
		) {
			this.hasSentPageView = false;
			this.hasLoaded = false;
			this.attemptToSendPageView();
			this.maybeDisableAppBanner();

			// If the post being viewed changes, track the reading time.
			if ( prevProps?.post?.ID !== this.props?.post?.ID ) {
				this.trackReadingTime( prevProps.post );
				this.trackScrollDepth( prevProps.post );
				this.trackExitBeforeCompletion( prevProps.post );
				this.setReadingStartTime();
				this.resetScroll();
				this.focusPostTitle();
			}
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

		// Don't handle keyboard shortcuts when focus is inside the popover.
		if ( event.target.closest?.( '.components-popover' ) ) {
			return;
		}

		if ( event?.metaKey || event?.ctrlKey ) {
			// avoid conflicting with the command palette shortcut cmd+k
			return;
		}

		switch ( event.key ) {
			// Close full post.
			case 'Escape': {
				return this.handleBack( event );
			}

			// Like post.
			case 'l': {
				return this.handleLike();
			}

			// Next post.
			case 'ArrowRight':
			case 'j': {
				return this.goToPost( this.props.nextPostKey );
			}

			// Previous post.
			case 'ArrowLeft':
			case 'k': {
				return this.goToPost( this.props.previousPostKey );
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

		if ( this.props.isLikePending || this.props.isUnlikePending ) {
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
		window.location.hash.startsWith( '#comment-' )
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
		const { post, site } = this.props;

		if (
			post &&
			post._state !== 'pending' &&
			site &&
			site.ID &&
			! site.is_error &&
			! this.hasSentPageView
		) {
			markPostSeen( post, site );
			this.hasSentPageView = true;

			// mark post as currently viewing
			this.props.setViewingFullPostKey( keyForPost( post ) );
		}

		if ( ! this.hasLoaded && post && post._state !== 'pending' ) {
			if ( this.isSeenEnabled() && ! post.is_seen ) {
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

	isSeenEnabled = () => {
		const { isWPForTeamsItem, hasOrganization, post, teams } = this.props;
		const isAutomattician = isAutomatticTeamMember( teams );

		return (
			isAutomattician ||
			( isEligibleForUnseen( { isWPForTeamsItem, hasOrganization } ) &&
				canBeMarkedAsSeen( { post } ) )
		);
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

	goToPost = ( postKey ) => {
		const { layout, setSelectedItem, showSelectedPost: showPost } = this.props;
		if ( postKey ) {
			// Track navigation usage
			let direction = 'unknown';
			if ( postKey === this.props.nextPostKey ) {
				direction = 'next';
			} else if ( postKey === this.props.previousPostKey ) {
				direction = 'previous';
			}
			recordTrackForPost( 'calypso_reader_article_navigation_clicked', this.props.post, {
				direction,
			} );

			if ( layout === 'recent' && setSelectedItem ) {
				setSelectedItem( postKey );
			} else {
				showPost( { postKey } );
			}
		}
	};

	focusPostTitle = () => {
		// Small delay to ensure DOM has updated after navigation
		setTimeout( () => {
			// Try to focus the title link, or the title itself, or the back button as fallback
			const focusTarget =
				document.querySelector( '.reader-full-post__header-title-link' ) ||
				document.querySelector( '.reader-full-post__header-title' ) ||
				document.querySelector( '.reader-back-button' );

			focusTarget?.focus();
		}, 100 );
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

	renderMarkAsSeenButton = () => {
		const { post } = this.props;
		const label = post.is_seen
			? fixMe( {
					text: 'Mark post as unread',
					newCopy: translate( 'Mark post as unread' ),
					oldCopy: translate( 'Mark post as unseen' ),
			  } )
			: fixMe( {
					text: 'Mark post as read',
					newCopy: translate( 'Mark post as read' ),
					oldCopy: translate( 'Mark post as seen' ),
			  } );

		return (
			<button
				type="button"
				className="reader-full-post__seen-button"
				title={ label }
				aria-label={ label }
				onClick={ post.is_seen ? this.markAsUnseen : this.markAsSeen }
			>
				<Gridicon icon={ post.is_seen ? 'not-visible' : 'visible' } size={ 18 } />
			</button>
		);
	};

	render() {
		const { post, site, feed, referralPost, commentsApiDisabled } = this.props;

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
		const commentCount = post?.discussion?.comment_count;
		const contentWidth = readerContentWidth();
		const feedUrl = post?.feed_URL;

		/*eslint-disable react/no-danger */
		/*eslint-disable react/jsx-no-target-blank */
		return (
			// add extra div wrapper for consistent content frame layout/styling for reader.
			<div>
				<ReaderMain className={ clsx( classes ) } forwardRef={ this.readerMainWrapper }>
					{ ! post || post._state === 'pending' ? (
						<DocumentHead title={ translate( 'Loading' ) } />
					) : (
						<DocumentHead
							title={ `${ post.title || getPostTitleFallback( post ) } ‹ ${ siteName } ‹ Reader` }
						/>
					) }
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
									showComments={
										isCommentsOpen( post ) ||
										isLoginRequiredToComment( post ) ||
										post.discussion?.comment_count > 0
									}
									renderMarkAsSeenButton={
										this.isSeenEnabled() ? this.renderMarkAsSeenButton : null
									}
									feedUrl={ feedUrl }
									siteUrl={ post.site_URL }
									onFollowToggle={ this.openSuggestedFollowsModal }
								/>
							) }

							{ post.featured_image && ! isFeaturedImageInContent( post ) && (
								<ReaderFullPostFeaturedImage post={ post } maxWidth={ contentWidth } />
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
								{ ! commentsApiDisabled &&
									( isCommentsOpen( post ) ||
										isLoginRequiredToComment( post ) ||
										post.discussion?.comment_count > 0 ) && (
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

							{ isDefaultLayout && (
								<ReaderFullPostNavigation
									previousPost={ this.props.previousPost }
									nextPost={ this.props.nextPost }
									previousPostKey={ this.props.previousPostKey }
									nextPostKey={ this.props.nextPostKey }
									previousPostUrl={ this.props.previousPostUrl }
									nextPostUrl={ this.props.nextPostUrl }
									onNavigate={ this.goToPost }
								/>
							) }

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

export const mapStateToFullPostProps = ( state, ownProps ) => {
	const { feedId, blogId, postId } = ownProps;
	const postKey = pickBy( { feedId: +feedId, blogId: +blogId, postId: +postId } );
	const post = ownProps.post || { _state: 'pending' };
	const currentPath = state.route.path.current;
	const feed = ownProps.feed;

	const { site_ID: siteId } = post;

	const props = {
		siteId,
		isWPForTeamsItem:
			isSiteWPForTeams( state, blogId ) ||
			( feed?.blog_ID ? isSiteWPForTeams( state, feed.blog_ID ) : false ),
		notificationsOpen: isNotificationsOpen( state ),
		post,
		postKey,
		currentPath,
		referralStream: getPreviousPath( state ),
		previousRoute: getPreviousRoute( state ),
	};

	if ( feedId && feed ) {
		props.feed = feed;
	}
	if ( ownProps.referral ) {
		props.referralPost = ownProps.referralPost;
	}

	return props;
};

const getPostSiteId = ( { post } ) =>
	post && ! post.is_external && post.site_ID ? +post.site_ID : undefined;

const ConnectedFullPostView = connect( mapStateToFullPostProps, {
	disableAppBanner,
	enableAppBanner,
	setViewingFullPostKey,
	unsetViewingFullPostKey,
	showSelectedPost,
} )(
	withSite(
		withPostLikes(
			withPostLikeActions( withSeenPostsMutations( withReaderTeams( FullPostView ) ) )
		),
		getPostSiteId
	)
);

export const withFullPostNavigation = ( WrappedComponent ) =>
	function FullPostNavigationContainer( props ) {
		const currentStreamKey = useSelector( getCurrentStream );
		const rawLocale = useSelector( getCurrentLocaleSlug );
		// Mirror `<Stream>`'s normalization so we look up the correct cached
		// stream variant — non-default locales carry the slug in the key.
		const localeSlug = rawLocale && ! isDefaultLocale( rawLocale ) ? rawLocale : null;
		const currentPostKey = pickBy( {
			feedId: props.feedId ? +props.feedId : undefined,
			blogId: props.blogId ? +props.blogId : undefined,
			postId: props.postId ? +props.postId : undefined,
		} );
		const { data: post } = usePost( Object.keys( currentPostKey ).length ? currentPostKey : null );
		const { data: referralPost } = usePost( props.referral );
		const commentsApiDisabled = usePostCommentsApiDisabled(
			{
				siteId: post?.site_ID,
				postId: post?.ID,
			},
			{ enabled: ! post?.is_external }
		);
		const { previousPostKey, nextPostKey } = useStreamPostKeySelection( {
			streamKey: currentStreamKey ?? '',
			localeSlug,
			currentPostKey: Object.keys( currentPostKey ).length ? currentPostKey : null,
		} );

		const { data: previousPost } = usePost( previousPostKey );
		const { data: nextPost } = usePost( nextPostKey );

		// Pre-compute the navigation URL so the prev/next card's `<a href>`
		// points at the destination the user lands on (middle-click /
		// open-in-new-tab respect it). For x-posts that's the original
		// blog/post — `showSelectedPost` handles the same redirection on
		// regular clicks, but the visible link must match.
		const previousPostUrl = useMemo(
			() => navigationUrlFor( previousPost, previousPostKey ),
			[ previousPost, previousPostKey ]
		);
		const nextPostUrl = useMemo(
			() => navigationUrlFor( nextPost, nextPostKey ),
			[ nextPost, nextPostKey ]
		);
		return (
			<WrappedComponent
				{ ...props }
				previousPostKey={ previousPostKey }
				nextPostKey={ nextPostKey }
				post={ post }
				referralPost={ referralPost }
				commentsApiDisabled={ commentsApiDisabled }
				previousPost={ previousPost }
				nextPost={ nextPost }
				previousPostUrl={ previousPostUrl }
				nextPostUrl={ nextPostUrl }
			/>
		);
	};

/**
 * Picks the URL the prev/next navigation card should link to. For x-posts the
 * stream-item wrapper is just a "X-post: …" stub on the local site; the user
 * actually lands on the original blog/post (`showSelectedPost` redirects on
 * click). Building the same URL here keeps the visible `<a href>` honest for
 * middle-click / open-in-new-tab. Falls back to the wrapper URL when the
 * wrapper isn't hydrated yet or has no resolvable x-post target.
 */
function navigationUrlFor( post, postKey ) {
	if ( ! postKey ) {
		return undefined;
	}
	if ( post && isXPost( post ) ) {
		const xMeta = XPostHelper.getXPostMetadata( post );
		if ( xMeta?.blogId && xMeta?.postId ) {
			return `/reader/blogs/${ xMeta.blogId }/posts/${ xMeta.postId }`;
		}
		// No `xpost_origin` IDs (P2 xposts without the metadata pair) — mirror
		// `showFullXPost`'s `window.open( xMeta.postURL )` fallback so the
		// visible `<a href>` matches where the click actually lands.
		if ( xMeta?.postURL ) {
			return xMeta.postURL;
		}
	}
	if ( postKey.feedId ) {
		return `/reader/feeds/${ postKey.feedId }/posts/${ postKey.postId }`;
	}
	return `/reader/blogs/${ postKey.blogId }/posts/${ postKey.postId }`;
}

const FullPostWithNavigation = withFullPostNavigation( ConnectedFullPostView );

export default function FullPostContainer( props ) {
	const { data: feed } = useFeedQuery( props.feedId );
	const follow = useSiteSubscriptionForFeed( props.feedId );
	const hasOrganization = useHasSiteSubscriptionOrganization( props.feedId, props.blogId );
	const feedWithIcon = feed ? { ...feed, site_icon: follow?.site_icon } : feed;

	return (
		<FullPostWithNavigation
			{ ...props }
			feed={ feedWithIcon }
			hasOrganization={ hasOrganization }
		/>
	);
}
