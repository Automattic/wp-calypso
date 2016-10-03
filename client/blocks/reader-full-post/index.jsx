/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate } from 'i18n-calypso';
import classNames from 'classnames';
import config from 'config';
import twemoji from 'twemoji';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import ReaderMain from 'components/reader-main';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import EmbedContainer from 'components/embed-container';
import PostExcerpt from 'components/post-excerpt';
import { setSection } from 'state/ui/actions';
import smartSetState from 'lib/react-smart-set-state';
import PostStore from 'lib/feed-post-store';
import SiteStore from 'lib/reader-site-store';
import FeedStore from 'lib/feed-store';
import { fetch as fetchFeed } from 'lib/feed-store/actions';
import { fetch as fetchSite } from 'lib/reader-site-store/actions';
import { fetchPost } from 'lib/feed-post-store/actions';
import ReaderFullPostHeader from './header';
import AuthorCompactProfile from 'blocks/author-compact-profile';
import LikeButton from 'blocks/like-button';
import { isDiscoverPost, isDiscoverSitePick, getSourceFollowUrl, getSiteUrl } from 'reader/discover/helper';
import { isDailyPostChallengeOrPrompt } from 'reader/daily-post/helper';
import DiscoverSiteAttribution from 'reader/discover/site-attribution';
import DailyPostButton from 'reader/daily-post';
import { shouldShowLikes } from 'reader/like-helper';
import { shouldShowComments } from 'blocks/comments/helper';
import CommentButton from 'blocks/comment-button';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';
import Comments from 'blocks/comments';
import scrollTo from 'lib/scroll-to';
import PostExcerptLink from 'reader/post-excerpt-link';
import { siteNameFromSiteAndPost } from 'reader/utils';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import ReaderFullPostActionLinks from './action-links';
import { state as SiteState } from 'lib/reader-site-store/constants';
import PostStoreActions from 'lib/feed-post-store/actions';
import { RelatedPostsFromSameSite, RelatedPostsFromOtherSites } from 'components/related-posts-v2';
import { getStreamUrlFromPost } from 'reader/route';
import { CANONICAL_IN_CONTENT } from 'state/reader/posts/display-types';
import { likePost, unlikePost } from 'lib/like-store/actions';
import LikeStore from 'lib/like-store/like-store';
import FeaturedImage from 'blocks/reader-full-post/featured-image';

export class FullPostView extends React.Component {
	constructor( props ) {
		super( props );
		[
			'handleBack',
			'handleCommentClick',
			'handleLike'
		].forEach( fn => {
			this[ fn ] = this[ fn ].bind( this );
		} );
		this.hasScrolledToCommentAnchor = false;
	}

	componentDidMount() {
		KeyboardShortcuts.on( 'close-full-post', this.handleBack );
		KeyboardShortcuts.on( 'like-selection', this.handleLike );
		this.parseEmoji();

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
		this.parseEmoji();

		// Send page view if applicable
		if ( get( prevProps, 'post.ID' ) !== get( this.props, 'post.ID' ) ||
			get( prevProps, 'feed.ID' ) !== get( this.props, 'feed.ID' ) ||
			get( prevProps, 'site.ID' ) !== get( this.props, 'site.ID' ) ) {
			this.hasSentPageView = false;
			this.hasLoaded = false;
			this.attemptToSendPageView();
		}

		this.checkForCommentAnchor();
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
	}

	handleBack() {
		this.props.onClose && this.props.onClose();
	}

	handleCommentClick() {
		recordAction( 'click_comments' );
		recordGaEvent( 'Clicked Post Comment Button' );
		recordTrackForPost( 'calypso_reader_full_post_comments_button_clicked', this.props.post );
		this.scrollToComments();
	}

	handleLike() {
		recordAction( 'click_like' );
		recordGaEvent( 'Clicked Like Post Button' );
		recordTrackForPost( 'calypso_reader_full_post_like_button_clicked', this.props.post );
		const { site_ID: siteId, ID: postId } = this.props.post;
		if ( LikeStore.isPostLikedByCurrentUser( siteId, postId ) ) {
			unlikePost( siteId, postId );
		} else {
			likePost( siteId, postId );
		}
	}

	// Does the URL contain the anchor #comments? If so, scroll to comments if we're not already there.
	checkForCommentAnchor() {
		const hash = window.location.hash.substr( 1 );
		if ( hash.indexOf( 'comments' ) > -1 ) {
			this.hasCommentAnchor = true;
		}
	}

	// Scroll to the top of the comments section.
	scrollToComments() {
		//setTimeout( () => {
			const commentsNode = ReactDom.findDOMNode( this.refs.commentsList );
			if ( commentsNode && commentsNode.offsetTop ) {
				scrollTo( {
					x: 0,
					y: commentsNode.offsetTop - 48,
					duration: 300
				} );
				if ( this.hasCommentAnchor ) {
					this.hasScrolledToCommentAnchor = true;
				}
			}
		//}, 0 );
	}

	parseEmoji() {
		twemoji.parse( this.refs.article, {
			base: config( 'twemoji_cdn_url' )
		} );
	}

	attemptToSendPageView() {
		const { post, site } = this.props;

		if ( post && post._state !== 'pending' &&
			site && site.state === SiteState.COMPLETE &&
			! this.hasSentPageView ) {
			PostStoreActions.markSeen( post );
			this.hasSentPageView = true;
		}

		if ( ! this.hasLoaded && post && post._state !== 'pending' ) {
			recordTrackForPost( 'calypso_reader_article_opened', post );
			this.hasLoaded = true;
		}
	}

	render() {
		const { post, site, feed } = this.props;
		const siteName = siteNameFromSiteAndPost( site, post );
		const classes = { 'reader-full-post': true };
		const showRelatedPosts = ! post.is_external && post.site_ID;
		const relatedPostsFromOtherSitesTitle = translate(
			'More on {{wpLink}}WordPress.com{{/wpLink}}',
			{
				components: {
					wpLink: <a href="/" className="reader-related-card-v2__link" />
				}
			}
		);

		if ( post.site_ID ) {
			classes[ 'blog-' + post.site_ID ] = true;
		}
		if ( post.feed_ID ) {
			classes[ 'feed-' + post.feed_ID ] = true;
		}

		/*eslint-disable react/no-danger*/
		return (
			<ReaderMain className={ classNames( classes ) }>
				<div className="reader-full-post__back-container">
					<Button className="reader-full-post__back" borderless compact onClick={ this.handleBack }>
						<Gridicon icon="arrow-left" /> { translate( 'Back' ) }
					</Button>
				</div>
				<div className="reader-full-post__content">
					<div className="reader-full-post__sidebar">
						{ post.author &&
							<AuthorCompactProfile
								author={ post.author }
								siteIcon={ get( site, 'icon.img' ) }
								feedIcon={ get( feed, 'image' ) }
								siteName={ post.site_name }
								siteUrl={ post.site_URL }
								feedUrl= { get( feed, 'feed_URL' ) }
								followCount={ site && site.subscribers_count }
								feedId={ +post.feed_ID }
								siteId={ +post.site_ID } />
						}
						{ shouldShowComments( post ) &&
							<CommentButton key="comment-button"
								commentCount={ post.discussion.comment_count }
								onClick={ this.handleCommentClick }
								tagName="div" />
						}
						{ shouldShowLikes( post ) &&
							<LikeButton siteId={ post.site_ID }
								postId={ post.ID }
								fullPost={ true }
								tagName="div" />
						}

					</div>
					<article className="reader-full-post__story" ref="article">
						<ReaderFullPostHeader post={ post } />

						{ post.featured_image && ( ! ( post.display_type & CANONICAL_IN_CONTENT ) ) &&
							<FeaturedImage src={ post.featured_image } />
						}
						{ post.use_excerpt
							? <PostExcerpt content={ post.better_excerpt ? post.better_excerpt : post.excerpt } />
							: <EmbedContainer>
									<div
										className="reader-full-post__story-content reader__full-post-content"
										dangerouslySetInnerHTML={ { __html: post.content } } />
								</EmbedContainer>
						}

						{ post.use_excerpt && ! isDiscoverPost( post )
							? <PostExcerptLink siteName={ siteName } postUrl={ post.URL } />
							: null
						}
						{ isDiscoverSitePick( post )
							? <DiscoverSiteAttribution
									attribution={ post.discover_metadata.attribution }
									siteUrl={ getSiteUrl( post ) }
									followUrl={ getSourceFollowUrl( post ) } />
							: null
						}
						{ isDailyPostChallengeOrPrompt( post )
							? <DailyPostButton post={ post } tagName="span" />
							: null
						}

						<ReaderFullPostActionLinks post={ post } site={ site } onCommentClick={ this.handleCommentClick } />

						{ showRelatedPosts &&
							<RelatedPostsFromSameSite siteId={ post.site_ID } postId={ post.ID }
								title={
									translate( 'More in {{ siteLink /}}', {
										components: {
											siteLink: ( <a href={ getStreamUrlFromPost( post ) } className="reader-related-card-v2__link">{ siteName }</a> )
										}
									} )
								}
								className="is-same-site" />
						}

						{ shouldShowComments( post )
							? <Comments ref="commentsList"
									post={ post }
									initialSize={ 25 }
									pageSize={ 25 }
									onCommentsUpdate={ this.checkForCommentAnchor } />
							: null
						}

						{ showRelatedPosts &&
							<RelatedPostsFromOtherSites siteId={ post.site_ID } postId={ post.ID }
								title={ relatedPostsFromOtherSitesTitle }
								className="is-other-site" />
						}
					</article>
				</div>
			</ReaderMain>
		);
	}
}

/**
 * A container for the FullPostView responsible for binding to Flux stores
 */
export class FullPostFluxContainer extends React.Component {
	constructor( props ) {
		super( props );
		this.state = this.getStateFromStores( props );
		this.updateState = this.updateState.bind( this );
		this.smartSetState = smartSetState;
	}

	getStateFromStores( props = this.props ) {
		const postKey = {
			blogId: props.blogId,
			feedId: props.feedId,
			postId: props.postId
		};

		const post = PostStore.get( postKey );

		if ( ! post ) {
			fetchPost( postKey );
		}

		let feed, site;

		if ( post && post.feed_ID ) {
			feed = FeedStore.get( post.feed_ID );
			if ( ! feed ) {
				fetchFeed( post.feed_ID );
			}
		}
		if ( post && post.site_ID && ! post.is_external ) {
			site = SiteStore.get( post.site_ID );
			if ( ! site ) {
				fetchSite( post.site_ID );
			}
		}

		return {
			post,
			site,
			feed
		};
	}

	updateState( newState = this.getStateFromStores() ) {
		this.smartSetState( newState );
	}

	componentWillMount() {
		PostStore.on( 'change', this.updateState );
		SiteStore.on( 'change', this.updateState );
		FeedStore.on( 'change', this.updateState );
	}

	componentWillReceiveProps( nextProps ) {
		this.updateState( this.getStateFromStores( nextProps ) );
	}

	componentWillUnmount() {
		PostStore.off( 'change', this.updateState );
		SiteStore.off( 'change', this.updateState );
		FeedStore.off( 'change', this.updateState );
	}

	render() {
		return this.state.post
			? <FullPostView
					onClose={ this.props.onClose }
					post={ this.state.post }
					site={ this.state.site && this.state.site.toJS() }
					feed={ this.state.feed && this.state.feed.toJS() } />
			: null;
	}
}

export default connect(
	state => { // eslint-disable-line no-unused-vars
		return { };
	},
	dispatch => {
		return bindActionCreators( {
			setSection
		}, dispatch );
	}
)( FullPostFluxContainer );
