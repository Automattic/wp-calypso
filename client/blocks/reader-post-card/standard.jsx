/**
 * External Dependencies
 */
import React from 'react';
import { partial } from 'lodash';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import ReaderFeaturedVideo from 'blocks/reader-featured-video';
import ReaderFeaturedImage from 'blocks/reader-featured-image';
import ReaderExcerpt from 'blocks/reader-excerpt';

const StandardPost = ( { post, children, isDiscover, expandCard, postKey, isExpanded, site } )=> {
	const canonicalMedia = post.canonical_media;
	let featuredAsset;
	if ( ! canonicalMedia ) {
		featuredAsset = null;
	} else if ( canonicalMedia.mediaType === 'video' ) {
		featuredAsset = (
			<ReaderFeaturedVideo
				{ ...canonicalMedia }
				videoEmbed={ canonicalMedia }
				onThumbnailClick={ partial( expandCard, { postKey, post, site } ) }
				isExpanded={ isExpanded }
			/>
		);
	} else {
		featuredAsset = <ReaderFeaturedImage imageUrl={ canonicalMedia.src } href={ post.URL } />;
	}

	return (
		<div className="reader-post-card__post" >
			{ featuredAsset }
			<div className="reader-post-card__post-details">
				<AutoDirection>
					<h1 className="reader-post-card__title">
						<a className="reader-post-card__title-link" href={ post.URL }>{ post.title }</a>
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
