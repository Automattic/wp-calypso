/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import FeaturedVideo from './featured-video';
import ReaderFeaturedImage from 'blocks/reader-featured-image';
import ReaderExcerpt from 'blocks/reader-excerpt';

const StandardPost = ( { post, children, isDiscover } )=> {
	const canonicalMedia = post.canonical_media;
	let featuredAsset;
	if ( ! canonicalMedia ) {
		featuredAsset = null;
	} else if ( canonicalMedia.mediaType === 'video' ) {
		featuredAsset = <FeaturedVideo { ...canonicalMedia } videoEmbed={ canonicalMedia } />;
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
		</div> );
};

StandardPost.propTypes = {
	post: React.PropTypes.object.isRequired,
	isDiscover: React.PropTypes.bool,
};

export default StandardPost;
