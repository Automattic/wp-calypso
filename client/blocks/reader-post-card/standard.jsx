/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import { get, partial } from 'lodash';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';
import ReaderExcerpt from 'blocks/reader-excerpt';
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
					<h1 className="reader-post-card__title">
						<a className="reader-post-card__title-link" href={ post.URL }>
							<Emojify>
								{ post.title }
							</Emojify>
						</a>
					</h1>
				</AutoDirection>
				<ReaderExcerpt post={ post } isDiscover={ isDiscover } />
				{ children }
			</div>
		</div>
	);
};

StandardPost.propTypes = {
	post: React.PropTypes.object.isRequired,
	isDiscover: React.PropTypes.bool,
};

export default StandardPost;
