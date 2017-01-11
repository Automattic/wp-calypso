/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import FeaturedVideo from './featured-video';
import FeaturedImage from './featured-image';

const StandardPost = ( { post, children } )=> {
	const canonicalMedia = post.canonical_media;
	let featuredAsset;
	if ( ! canonicalMedia ) {
		featuredAsset = null;
	} else if ( canonicalMedia.mediaType === 'video' ) {
		featuredAsset = <FeaturedVideo { ...canonicalMedia } videoEmbed={ canonicalMedia } />;
	} else {
		featuredAsset = <FeaturedImage imageUri={ canonicalMedia.src } href={ post.URL } />;
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
				<AutoDirection>
					<div className="reader-post-card__excerpt"
						dangerouslySetInnerHTML={ { __html: post.better_excerpt || post.excerpt } } // eslint-disable-line react/no-danger
					/>
				</AutoDirection>
				{ children }
			</div>
		</div> );
};

export default StandardPost;
