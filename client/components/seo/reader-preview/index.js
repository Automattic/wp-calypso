/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { truncate } from 'lodash';
import { Card } from '@automattic/components';

/**
 * Internal Dependencies
 */
import PostByline from './byline';
import PhotoPost from './photo';
import StandardPost from './standard';

/**
 * Style dependencies
 */
import './style.scss';

const ReaderPreview = ( { site, readerPost, postExcerpt, postImage } ) => {
	// Add some ReaderPost specific properties that are necessary
	const post = Object.assign(
		{},
		readerPost,
		{ better_excerpt: postExcerpt },
		postImage && { canonical_media: { src: postImage } },
		{
			author: Object.assign( {}, readerPost.author, { has_avatar: true } ),
		}
	);

	const isPhotoPost = postImage && ! postExcerpt;
	const title = truncate( post.title, { length: 140, separator: /,? +/ } );

	const classes = classnames( 'reader-post-card', {
		'has-thumbnail': !! post.canonical_media,
		'is-photo': isPhotoPost,
	} );

	// Set up post card
	let readerPostCard;
	if ( isPhotoPost ) {
		readerPostCard = <PhotoPost post={ post } site={ site } title={ title }></PhotoPost>;
	} else {
		readerPostCard = <StandardPost post={ post } title={ title } site={ site }></StandardPost>;
	}

	return (
		<Card className={ classes }>
			<PostByline post={ post } site={ site } showSiteName={ true } showAvatar={ true } />
			{ readerPostCard }
		</Card>
	);
};

ReaderPreview.propTypes = {
	site: PropTypes.object,
	readerPost: PropTypes.object,
	postExcerpt: PropTypes.string,
	postImage: PropTypes.string,
};

export default ReaderPreview;
