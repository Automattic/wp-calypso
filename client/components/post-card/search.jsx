/**
 * External Dependencies
 */
import React from 'react';
import noop from 'lodash/noop';
import classnames from 'classnames';
import partial from 'lodash/partial';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import AuthorAndSite from './author-and-site';
import PostTime from 'reader/post-time';
import FollowButton from 'reader/follow-button';
import LikeButton from 'reader/like-button';
import CommentButton from 'components/comment-button';

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
		<ul className="post-card__search-byline">
			<li>
				<AuthorAndSite post={ post } site={ site } feed={ feed } showGravatar={ true } />
			</li>
			<li>
				<PostTime date={ post.date } />
			</li>
			<li>
				<FollowButton siteUrl={ post.site_URL } />
			</li>
		</ul>
	);
}

export function SearchPostCard( { post, site, feed, onClick = noop } ) {
	const featuredImage = post.canonical_image;
	const classes = classnames( 'post-card__search', {
		'has-thumbnail': !! featuredImage
	} );
	return (
		<Card className={ classes } onClick={ partial( onClick, { post, site, feed } ) }>
		{ featuredImage && <FeaturedImage image={ featuredImage } href={ post.URL } /> }
		<h1 className="post-card__search-title">{ post.title }</h1>
		<div className="post-card__search-social">
			<CommentButton commentCount={ post.discussion.comment_count } tagName="span" showLabel={ false }/>
			<LikeButton siteId={ post.site_ID } postId={ post.ID } tagName="span" showCount={ true } showLabel={ false } />
		</div>
		<div className="post-card__search-byline">
			<SearchByline post={ post } site={ site } feed={ feed } />
		</div>
		<div className="post-card__search-excerpt">{ post.excerpt }</div>
		</Card>
	);
}

export default SearchPostCard;
