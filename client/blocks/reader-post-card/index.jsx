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
import DisplayTypes from 'state/reader/posts/display-types';
import Gravatar from 'components/gravatar';
import Gridicon from 'components/gridicon';
import ReaderPostActions from 'blocks/reader-post-actions';

function FeaturedImage( { image, href } ) {
	return (
		<a className="reader-post-card__featured-image" href={ href } style={ {
			backgroundImage: 'url(' + image.uri + ')',
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: '50% 50%'
		} } ></a> );
}

function PostByline( { post } ) {
	return (
		<div className="reader-post-card__meta ignore-click">
			<Gravatar user={ post.author } />
			<div className="reader-post-card__meta-details">
				<a className="reader-post-card__author reader-post-card__link">Sue Smith</a>
				<a className="reader-post-card__link">catsandfurballs.wordpress.com</a>
				<div className="reader-post-card__timestamp-and-tag">
					<span className="reader-post-card__timestamp">1 hour ago</span>
					<span className="reader-post-card__tag"><Gridicon icon="tag" />Pets</span>
				</div>
			</div>
		</div>
	);
}

export function RefreshPostCard( { post, site, feed, onClick = noop, onCommentClick = noop } ) {
	const featuredImage = post.canonical_image;
	const isPhotoOnly = post.display_type & DisplayTypes.PHOTO_ONLY;
	const title = truncate( post.title, {
		length: isPhotoOnly ? 50 : 140,
		separator: /,?\s+/ // a sequence of whitespace, optionally proceeded by a comma
	} );
	const classes = classnames( 'reader-post-card', {
		'has-thumbnail': !! featuredImage,
		'is-photo': isPhotoOnly
	} );

	return (
		<Card className={ classes } onClick={ partial( onClick, { post, site, feed } ) }>
			<PostByline post={ post } site={ site } feed={ feed } />
			<div className="reader-post-card__post">
				{ featuredImage && <FeaturedImage image={ featuredImage } href={ post.URL } /> }
				<div className="reader-post-card__post-details">
					<h1 className="reader-post-card__title">
						<a className="reader-post-card__title-link" href={ post.URL }>{ title }</a>
					</h1>
					<div className="reader-post-card__excerpt">{ post.short_excerpt }</div>
				</div>
			</div>
			{ post &&
				<ReaderPostActions
					post={ post }
					showVisit={ true }
					onCommentClick={ onCommentClick }
					showEdit={ false }
					className="ignore-click" />
			}
		</Card>
	);
}

export default RefreshPostCard;
