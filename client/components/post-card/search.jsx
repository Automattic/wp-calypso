/**
 * External Dependencies
 */
import React from 'react';
import { partial, noop, truncate } from 'lodash';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import AuthorAndSite from './author-and-site';
import FollowButton from 'reader/follow-button';
import LikeButton from 'reader/like-button';
import CommentButton from 'components/comment-button';
import DisplayTypes from 'state/reader/posts/display-types';

function FeaturedImage( { image, href } ) {
	return (
		<a className="post-card__search-featured-image" href={ href } style={ {
			backgroundImage: 'url(' + image.uri + ')',
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: '50% 50%'
		} } ></a> );
}

function SearchByline( { post, site, feed } ) {
	return (
		<div className="post-card__search-byline ignore-click">
			<span className="post-card__search-byline-item">
				<AuthorAndSite post={ post } site={ site } feed={ feed } showGravatar={ true } />
				<FollowButton siteUrl={ post.site_URL } railcar={ post.railcar } />
			</span>
		</div>
	);
}

export function SearchPostCard( { post, site, feed, onClick = noop, onCommentClick = noop } ) {
	const featuredImage = post.canonical_image;
	const isPhotoOnly = post.display_type & DisplayTypes.PHOTO_ONLY;
	const title = truncate( post.title, {
		length: isPhotoOnly ? 50 : 140,
		separator: /,? +/
	} );
	const classes = classnames( 'post-card__search', {
		'has-thumbnail': !! featuredImage,
		'is-photo': isPhotoOnly
	} );

	return (
		<Card className={ classes } onClick={ partial( onClick, { post, site, feed } ) }>
		{ featuredImage && <FeaturedImage image={ featuredImage } href={ post.URL } /> }
			<div className="post-card__search-social ignore-click">
				<CommentButton
					commentCount={ post.discussion.comment_count }
					tagName="span" showLabel={ false }
					onClick={ onCommentClick }/>
				<LikeButton siteId={ post.site_ID } postId={ post.ID } tagName="span" showZeroCount={ false } showLabel={ false } />
			</div>
			<h1 className="post-card__search-title">
				<a className="post-card__search-title-link" href={ post.URL }>{ title }</a>
			</h1>
			<SearchByline post={ post } site={ site } feed={ feed } />
			<div className="post-card__search-excerpt">{ post.short_excerpt }</div>
		</Card>
	);
}

export default SearchPostCard;
