/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { noop, truncate, trim, get } from 'lodash';
import classnames from 'classnames';
import ReactDom from 'react-dom';
import closest from 'component-closest';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import Card from 'components/card';
import DisplayTypes from 'state/reader/posts/display-types';
import ReaderPostActions from 'blocks/reader-post-actions';
import * as stats from 'reader/stats';
import PostByline from './byline';
import FeaturedVideo from './featured-video';
import FeaturedImage from './featured-image';
import FollowButton from 'reader/follow-button';
import PostGallery from './gallery';
import PostPhoto from './photo';
import DailyPostButton from 'blocks/daily-post-button';
import { isDailyPostChallengeOrPrompt } from 'blocks/daily-post-button/helper';
import * as DiscoverHelper from 'reader/discover/helper';
import DiscoverFollowButton from 'reader/discover/follow-button';
import PostStoreActions from 'lib/feed-post-store/actions';

export default class ReaderPostCard extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		isSelected: PropTypes.bool,
		onClick: PropTypes.func,
		onCommentClick: PropTypes.func,
		showPrimaryFollowButton: PropTypes.bool,
		originalPost: PropTypes.object, // used for Discover only
		showEntireExcerpt: PropTypes.bool,
		useBetterExcerpt: PropTypes.bool,
		showSiteName: PropTypes.bool,
		followSource: PropTypes.string,
	};

	static defaultProps = {
		onClick: noop,
		onCommentClick: noop,
		isSelected: false,
		showEntireExcerpt: false,
		useBetterExcerpt: true
	};

	propagateCardClick = () => {
		// If we have an original post available (e.g. for a Discover pick), send the original post
		// to the full post view
		const postToOpen = this.props.originalPost ? this.props.originalPost : this.props.post;
		this.props.onClick( postToOpen );
	}

	handleCardClick = ( event ) => {
		const rootNode = ReactDom.findDOMNode( this ),
			selection = window.getSelection && window.getSelection();

		// if the click has modifier or was not primary, ignore it
		if ( event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			if ( closest( event.target, '.reader-post-card__title-link', true, rootNode ) ) {
				stats.recordPermalinkClick( 'card_title_with_modifier', this.props.post );
			}
			return;
		}

		if ( closest( event.target, '.should-scroll', true, rootNode ) ) {
			setTimeout( function() {
				window.scrollTo( 0, 0 );
			}, 100 );
		}

		// declarative ignore
		if ( closest( event.target, '.ignore-click, [rel~=external]', true, rootNode ) ) {
			return;
		}

		// ignore clicks on anchors inside inline content
		if ( closest( event.target, 'a', true, rootNode ) && closest( event.target, '.reader-post-card__excerpt', true, rootNode ) ) {
			return;
		}

		// ignore clicks when highlighting text
		if ( selection && selection.toString() ) {
			return;
		}

		// programattic ignore
		if ( ! event.defaultPrevented ) { // some child handled it
			event.preventDefault();
			this.propagateCardClick();
		}
	}

	handlePhotoCardExpanded = () => {
		stats.recordTrackForPost( 'calypso_reader_photo_expanded', this.props.post );

		// Record page view
		PostStoreActions.markSeen( this.props.post );
		stats.recordTrackForPost( 'calypso_reader_article_opened', this.props.post );
	}

	render() {
		const {
			post,
			originalPost,
			site,
			feed,
			onCommentClick,
			showPrimaryFollowButton,
			isSelected,
			showEntireExcerpt,
			useBetterExcerpt,
			showSiteName,
			followSource,
		} = this.props;
		const isPhotoOnly = !! ( post.display_type & DisplayTypes.PHOTO_ONLY );
		const isGallery = !! ( post.display_type & DisplayTypes.GALLERY );
		const classes = classnames( 'reader-post-card', {
			'has-thumbnail': !! post.canonical_media,
			'is-photo': isPhotoOnly,
			'is-gallery': isGallery,
			'is-selected': isSelected,
			'is-showing-entire-excerpt': showEntireExcerpt
		} );
		const showExcerpt = ! isPhotoOnly;
		const excerptAttribute = useBetterExcerpt && trim( post.better_excerpt ) ? 'better_excerpt' : 'excerpt';
		let title = truncate( post.title, {
			length: 140,
			separator: /,? +/
		} );
		const isDiscoverPost = DiscoverHelper.isDiscoverPost( post );
		const discoverBlogName = isDiscoverPost && get( post, 'discover_metadata.attribution.blog_name' );

		if ( ! title && isPhotoOnly ) {
			title = '\xa0'; // force to non-breaking space if empty so that the title h1 doesn't collapse and complicate things
		}

		let followUrl;
		if ( showPrimaryFollowButton ) {
			if ( isDiscoverPost ) {
				followUrl = DiscoverHelper.getSourceFollowUrl( post );
			} else {
				followUrl = feed ? feed.feed_URL : post.site_URL;
			}
		}

		let featuredAsset;
		if ( ! post.canonical_media ) {
			featuredAsset = null;
		} else if ( post.canonical_media.mediaType === 'video' ) {
			featuredAsset = <FeaturedVideo { ...post.canonical_media } videoEmbed={ post.canonical_media } />;
		} else {
			featuredAsset = isPhotoOnly
				? <PostPhoto imageUri={ post.canonical_media.src } href={ post.URL } imageSize={ {
					height: post.canonical_media.height,
					width: post.canonical_media.width,
				} } onExpanded={ this.handlePhotoCardExpanded } />
				: <FeaturedImage imageUri={ post.canonical_media.src } href={ post.URL } />;
		}

		return (
			<Card className={ classes } onClick={ this.handleCardClick }>
				<PostByline post={ post } site={ site } feed={ feed } showSiteName={ showSiteName } />
				{ showPrimaryFollowButton && followUrl && <FollowButton siteUrl={ followUrl } followSource={ followSource } /> }
				<div className="reader-post-card__post">
					{ ! isGallery && featuredAsset }
					{ isGallery && <PostGallery post={ post } /> }
					<div className="reader-post-card__post-details">
						<AutoDirection>
							<h1 className="reader-post-card__title">
								<a className="reader-post-card__title-link" href={ post.URL }>{ title }</a>
							</h1>
						</AutoDirection>
						{ showExcerpt && (
								<AutoDirection>
									<div className="reader-post-card__excerpt"
										dangerouslySetInnerHTML={ { __html: post[ excerptAttribute ] } } // eslint-disable-line react/no-danger
									/>
								</AutoDirection> )
						}
						{ isDailyPostChallengeOrPrompt( post ) && <DailyPostButton post={ post } tagName="span" /> }
						{ discoverBlogName &&
							<DiscoverFollowButton
									siteName={ discoverBlogName }
									followUrl={ DiscoverHelper.getSourceFollowUrl( post ) } />
						}

						{ post &&
							<ReaderPostActions
								post={ originalPost ? originalPost : post }
								visitUrl = { post.URL }
								showVisit={ true }
								showMenu={ true }
								showMenuFollow={ ! isDiscoverPost }
								onCommentClick={ onCommentClick }
								showEdit={ false }
								className="ignore-click"
								iconSize={ 18 } />
						}
					</div>
				</div>
				{ this.props.children }
			</Card>
		);
	}
}
