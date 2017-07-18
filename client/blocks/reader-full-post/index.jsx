/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import classNames from 'classnames';
import { get, startsWith } from 'lodash';

/**
 * Internal Dependencies
 */
import PostStore from 'lib/feed-post-store';
import AutoDirection from 'components/auto-direction';
import ReaderMain from 'components/reader-main';
import EmbedContainer from 'components/embed-container';
import PostExcerpt from 'components/post-excerpt';
import { setSection } from 'state/ui/actions';
import smartSetState from 'lib/react-smart-set-state';
import { fetchPost } from 'lib/feed-post-store/actions';
import ReaderFullPostHeader from './header';
import AuthorCompactProfile from 'blocks/author-compact-profile';
import LikeButton from 'reader/like-button';
import {
	isDiscoverPost,
	isDiscoverSitePick,
	getSourceFollowUrl,
	getSiteUrl,
} from 'reader/discover/helper';
import DiscoverSiteAttribution from 'reader/discover/site-attribution';
import DailyPostButton from 'blocks/daily-post-button';
import { isDailyPostChallengeOrPrompt } from 'blocks/daily-post-button/helper';
import { shouldShowLikes } from 'reader/like-helper';
import { shouldShowComments } from 'blocks/comments/helper';
import CommentButton from 'blocks/comment-button';
import {
	recordAction,
	recordGaEvent,
	recordTrackForPost,
	recordPermalinkClick,
} from 'reader/stats';
import Comments from 'blocks/comments';
import scrollTo from 'lib/scroll-to';
import PostExcerptLink from 'reader/post-excerpt-link';
import { getSiteName } from 'reader/get-helpers';
import { keyForPost } from 'lib/feed-stream-store/post-key';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import ReaderPostActions from 'blocks/reader-post-actions';
import PostStoreActions from 'lib/feed-post-store/actions';
import { RelatedPostsFromSameSite, RelatedPostsFromOtherSites } from 'components/related-posts-v2';
import { getStreamUrlFromPost } from 'reader/route';
import { likePost, unlikePost } from 'lib/like-store/actions';
import LikeStore from 'lib/like-store/like-store';
import FeaturedImage from 'blocks/reader-full-post/featured-image';
import { getFeed } from 'state/reader/feeds/selectors';
import { getSite } from 'state/reader/sites/selectors';
import QueryReaderSite from 'components/data/query-reader-site';
import QueryReaderFeed from 'components/data/query-reader-feed';
import ExternalLink from 'components/external-link';
import DocumentHead from 'components/data/document-head';
import ReaderFullPostUnavailable from './unavailable';
import ReaderFullPostBack from './back';
import { isFeaturedImageInContent } from 'lib/post-normalizer/utils';
import ReaderFullPostContentPlaceholder from './placeholders/content';
import * as FeedStreamStoreActions from 'lib/feed-stream-store/actions';
import { getLastStore } from 'reader/controller-helper';
import { showSelectedPost } from 'reader/utils';
import Emojify from 'components/emojify';

export class FullPostView extends React.Component {
	static propTypes = {
		post: React.PropTypes.object.isRequired,
		onClose: React.PropTypes.func.isRequired,
		referralPost: React.PropTypes.object,
	};

	hasScrolledToCommentAnchor = false;

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

		this.checkForCommentAnchor();

		// If we have a comment anchor, scroll to comments
		if ( this.hasCommentAnchor && ! this.hasScrolledToCommentAnchor ) {
			this.scrollToComments();
		}
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.shouldShowComments ) {
			this.hasScrolledToCommentAnchor = false;
			this.checkForCommentAnchor();
		}
	}

	componentWillUnmount() {
		KeyboardShortcuts.off( 'close-full-post', this.handleBack );
		KeyboardShortcuts.off( 'like-selection', this.handleLike );
		KeyboardShortcuts.off( 'move-selection-down', this.goToNextPost );
		KeyboardShortcuts.off( 'move-selection-up', this.goToPreviousPost );
	}

	handleBack = event => {
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
		const { site_ID: siteId, ID: postId } = this.props.post;
		let liked;

		if ( LikeStore.isPostLikedByCurrentUser( siteId, postId ) ) {
			unlikePost( siteId, postId );
			liked = false;
		} else {
			likePost( siteId, postId );
			liked = true;
		}

		recordAction( liked ? 'liked_post' : 'unliked_post' );
		recordGaEvent( liked ? 'Clicked Like Post' : 'Clicked Unlike Post' );
		recordTrackForPost(
			liked ? 'calypso_reader_article_liked' : 'calypso_reader_article_unliked',
			this.props.post,
			{ context: 'full-post', event_source: 'keyboard' },
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

	// Does the URL contain the anchor #comments? If so, scroll to comments if we're not already there.
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
			const commentsNode = ReactDom.findDOMNode( this.refs.commentsWrapper );
			if ( commentsNode && commentsNode.offsetTop ) {
				scrollTo( {
					x: 0,
					y: commentsNode.offsetTop - 48,
					duration: 300,
					onComplete: () => {
						// check to see if the comment node moved while we were scrolling
						// and scroll to the end position
						const commentsNodeAfterScroll = ReactDom.findDOMNode( this.refs.commentsWrapper );
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

		if ( post && post._state !== 'pending' && site && site.ID && ! this.hasSentPageView ) {
			PostStoreActions.markSeen( post, site );
			this.hasSentPageView = true;
		}

		if ( ! this.hasLoaded && post && post._state !== 'pending' ) {
			recordTrackForPost( 'calypso_reader_article_opened', post );
			this.hasLoaded = true;
		}
	};

	goToNextPost = () => {
		const store = getLastStore();
		if ( store ) {
			if ( ! store.getSelectedPostKey() ) {
				store.selectItem( keyForPost( this.props.post ), store.id );
			}
			FeedStreamStoreActions.selectNextItem( store.getID() );
			showSelectedPost( { store, postKey: store.getSelectedPostKey() } );
		}
	};

	goToPreviousPost = () => {
		const store = getLastStore();
		if ( store ) {
			if ( ! store.getSelectedPostKey() ) {
				store.selectItem( keyForPost( this.props.post ), store.id );
			}
			FeedStreamStoreActions.selectPrevItem( store.getID() );
			showSelectedPost( { store, postKey: store.getSelectedPostKey() } );
		}
	};

	render() {
		const { post, site, feed, referralPost } = this.props;

		if ( post._state === 'error' ) {
			return <ReaderFullPostUnavailable post={ post } onBackClick={ this.handleBack } />;
		}

		const siteName = getSiteName( { site, post } );
		const classes = { 'reader-full-post': true };
		const showRelatedPosts = ! post.is_external && post.site_ID;
		const relatedPostsFromOtherSitesTitle = translate(
			'More on {{wpLink}}WordPress.com{{/wpLink}}',
			{
				components: {
					wpLink: <a href="/" className="reader-related-card-v2__link" />,
				},
			},
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

		/*eslint-disable react/no-danger */
		/*eslint-disable react/jsx-no-target-blank */
		return (
			<ReaderMain className={ classNames( classes ) }>
				{ ! post || post._state === 'pending'
					? <DocumentHead title={ translate( 'Loading' ) } />
					: <DocumentHead title={ `${ post.title } ‹ ${ siteName } ‹ Reader` } /> }
				{ post && post.feed_ID && <QueryReaderFeed feedId={ +post.feed_ID } /> }
				{ post &&
					! post.is_external &&
					post.site_ID &&
					<QueryReaderSite siteId={ +post.site_ID } /> }
				<ReaderFullPostBack onBackClick={ this.handleBack } />
				<div className="reader-full-post__visit-site-container">
					<ExternalLink
						icon={ true }
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
						{ ! isLoading &&
							post.author &&
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
							/> }
						{ shouldShowComments( post ) &&
							<CommentButton
								key="comment-button"
								commentCount={ commentCount }
								onClick={ this.handleCommentClick }
								tagName="div"
							/> }
						{ shouldShowLikes( post ) &&
							<LikeButton
								siteId={ +post.site_ID }
								postId={ +post.ID }
								fullPost={ true }
								tagName="div"
							/> }
					</div>
					<Emojify>
						<article className="reader-full-post__story" ref="article">
							<ReaderFullPostHeader post={ post } referralPost={ referralPost } />

							{ post.featured_image &&
								! isFeaturedImageInContent( post ) &&
								<FeaturedImage src={ post.featured_image } /> }
							{ isLoading && <ReaderFullPostContentPlaceholder /> }
							{ post.use_excerpt
								? <PostExcerpt
										content={ post.better_excerpt ? post.better_excerpt : post.excerpt }
									/>
								: <EmbedContainer>
										<AutoDirection>
											<div
												className="reader-full-post__story-content"
												dangerouslySetInnerHTML={ { __html: post.content } }
											/>
										</AutoDirection>
									</EmbedContainer> }

							{ post.use_excerpt &&
								! isDiscoverPost( post ) &&
								<PostExcerptLink siteName={ siteName } postUrl={ post.URL } /> }
							{ isDiscoverSitePick( post ) &&
								<DiscoverSiteAttribution
									attribution={ post.discover_metadata.attribution }
									siteUrl={ getSiteUrl( post ) }
									followUrl={ getSourceFollowUrl( post ) }
								/> }
							{ isDailyPostChallengeOrPrompt( post ) &&
								<DailyPostButton post={ post } site={ site } tagName="span" /> }

							<ReaderPostActions
								post={ post }
								site={ site }
								onCommentClick={ this.handleCommentClick }
								fullPost={ true }
							/>

							{ showRelatedPosts &&
								<RelatedPostsFromSameSite
									siteId={ +post.site_ID }
									postId={ +post.ID }
									title={ translate( 'More in {{ siteLink /}}', {
										components: {
											siteLink: (
												<a
													href={ getStreamUrlFromPost( post ) }
													/* eslint-disable wpcalypso/jsx-classname-namespace */
													className="reader-related-card-v2__link"
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
								/> }

							<div className="reader-full-post__comments-wrapper" ref="commentsWrapper">
								{ shouldShowComments( post )
									? <Comments
											ref="commentsList"
											post={ post }
											initialSize={ startingCommentId ? commentCount : 10 }
											pageSize={ 25 }
											startingCommentId={ startingCommentId }
											commentCount={ commentCount }
										/>
									: null }
							</div>

							{ showRelatedPosts &&
								<RelatedPostsFromOtherSites
									siteId={ +post.site_ID }
									postId={ +post.ID }
									title={ relatedPostsFromOtherSitesTitle }
									/* eslint-disable wpcalypso/jsx-classname-namespace */
									className="is-other-site"
									/* eslint-enable wpcalypso/jsx-classname-namespace */
									onPostClick={ this.handleRelatedPostFromOtherSiteClicked }
								/> }
						</article>
					</Emojify>
				</div>
			</ReaderMain>
		);
	}
}

const ConnectedFullPostView = connect(
	( state, ownProps ) => {
		const { site_ID: siteId, feed_ID: feedId, is_external: isExternal } = ownProps.post;

		const props = {};

		if ( ! isExternal && siteId ) {
			props.site = getSite( state, siteId );
		}
		if ( feedId ) {
			props.feed = getFeed( state, feedId );
		}

		return props;
	},
	{ setSection },
)( FullPostView );

/**
 * A container for the FullPostView responsible for binding to Flux stores
 */
export default class FullPostFluxContainer extends React.Component {
	constructor( props ) {
		super( props );
		this.state = this.getStateFromStores( props );
		this.smartSetState = smartSetState;
	}

	static propTypes = {
		blogId: React.PropTypes.string,
		postId: React.PropTypes.string.isRequired,
		onClose: React.PropTypes.func.isRequired,
		onPostNotFound: React.PropTypes.func.isRequired,
		referral: React.PropTypes.object,
	};

	getStateFromStores( props = this.props ) {
		const postKey = {
			blogId: props.blogId,
			feedId: props.feedId,
			postId: props.postId,
		};

		let referralPost;
		if ( props.referral ) {
			referralPost = PostStore.get( props.referral );
			if ( ! referralPost ) {
				fetchPost( props.referral );
			}
		}

		const post = PostStore.get( postKey );

		if ( ! post ) {
			fetchPost( postKey );
		}
		return {
			post,
			referralPost,
		};
	}

	updateState = ( newState = this.getStateFromStores() ) => {
		this.smartSetState( newState );
	};

	componentWillMount() {
		PostStore.on( 'change', this.updateState );
	}

	componentWillReceiveProps( nextProps ) {
		this.updateState( this.getStateFromStores( nextProps ) );
	}

	componentWillUnmount() {
		PostStore.off( 'change', this.updateState );
	}

	render() {
		return this.state.post
			? <ConnectedFullPostView
					onClose={ this.props.onClose }
					post={ this.state.post }
					referralPost={ this.state.referralPost }
				/>
			: null;
	}
}
