/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { noop, truncate } from 'lodash';
import classnames from 'classnames';
import ReactDom from 'react-dom';
import closest from 'component-closest';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import DisplayTypes from 'state/reader/posts/display-types';
import ReaderPostActions from 'blocks/reader-post-actions';
import * as stats from 'reader/stats';
import PostByline from './byline';
import FeaturedVideo from './featured-video';
import FeaturedImage from './featured-image';
import FollowButton from 'reader/follow-button';
import PostGallery from './gallery';
import DailyPostButton from 'blocks/daily-post-button';
import { isDailyPostChallengeOrPrompt } from 'blocks/daily-post-button/helper';

export default class RefreshPostCard extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		onClick: PropTypes.func,
		onCommentClick: PropTypes.func,
		showPrimaryFollowButton: PropTypes.bool,
		originalPost: PropTypes.object // used for Discover only
	};

	static defaultProps = {
		onClick: noop,
		onCommentClick: noop
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

	render() {
		const { post, originalPost, site, feed, onCommentClick, showPrimaryFollowButton } = this.props;
		const isPhotoOnly = !! ( post.display_type & DisplayTypes.PHOTO_ONLY );
		const isGallery = !! ( post.display_type & DisplayTypes.GALLERY );
		const classes = classnames( 'reader-post-card', {
			'has-thumbnail': !! post.canonical_media,
			'is-photo': isPhotoOnly,
			'is-gallery': isGallery
		} );
		const showExcerpt = ! isPhotoOnly;
		let title = truncate( post.title, {
			length: 140,
			separator: /,? +/
		} );

		if ( ! title && isPhotoOnly ) {
			title = '\xa0'; // force to non-breaking space if empty so that the title h1 doesn't collapse and complicate things
		}

		let followUrl;
		if ( showPrimaryFollowButton ) {
			followUrl = feed ? feed.feed_URL : post.site_URL;
		}

		let featuredAsset;
		if ( ! post.canonical_media ) {
			featuredAsset = null;
		} else if ( post.canonical_media.mediaType === 'video' ) {
			featuredAsset = <FeaturedVideo { ...post.canonical_media } videoEmbed={ post.canonical_media } />;
		} else {
			featuredAsset = <FeaturedImage imageUri={ post.canonical_media.src } href={ post.URL } />;
		}

		return (
			<Card className={ classes } onClick={ this.handleCardClick }>
				<PostByline post={ post } site={ site } feed={ feed } />
				{ showPrimaryFollowButton && <FollowButton siteUrl={ followUrl } /> }
				<div className="reader-post-card__post">
					{ ! isGallery && featuredAsset }
					{ isGallery && <PostGallery post={ post } /> }
					<div className="reader-post-card__post-details">
						<h1 className="reader-post-card__title">
							<a className="reader-post-card__title-link" href={ post.URL }>{ title }</a>
						</h1>
						{ showExcerpt && <div className="reader-post-card__excerpt">{ post.better_excerpt_no_html }</div> }
						{ isDailyPostChallengeOrPrompt( post ) && <DailyPostButton post={ post } tagName="span" /> }
						{ post &&
							<ReaderPostActions
								post={ originalPost ? originalPost : post }
								showVisit={ true }
								showMenu={ true }
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
