/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { get, partial } from 'lodash';

/**
 * Internal Dependencies
 */
import AutoDirection from 'calypso/components/auto-direction';
import Emojify from 'calypso/components/emojify';
import ReaderExcerpt from 'calypso/blocks/reader-excerpt';
import FeaturedAsset from './featured-asset';

const StandardPost = ( { post, children, isDiscover, expandCard, postKey, isExpanded, site } ) => {
	let onVideoThumbnailClick = null;
	if ( get( post, 'canonical_media.mediaType' ) === 'video' ) {
		onVideoThumbnailClick = partial( expandCard, { postKey, post, site } );
	}
	return (
		<div className="reader-post-card__post">
			<FeaturedAsset
				canonicalMedia={ post.canonical_media }
				postUrl={ post.URL }
				onVideoThumbnailClick={ onVideoThumbnailClick }
				isVideoExpanded={ isExpanded }
			/>
			<div className="reader-post-card__post-details">
				<AutoDirection>
					<h2 className="reader-post-card__title">
						<a className="reader-post-card__title-link" href={ post.URL }>
							<Emojify>{ post.title }</Emojify>
						</a>
					</h2>
				</AutoDirection>
				<ReaderExcerpt post={ post } isDiscover={ isDiscover } />
				{ children }
			</div>
		</div>
	);
};

StandardPost.propTypes = {
	post: PropTypes.object.isRequired,
	isDiscover: PropTypes.bool,
};

export default StandardPost;
