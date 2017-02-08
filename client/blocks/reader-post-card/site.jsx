/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import FeaturedImage from './featured-image';
import ReaderPostCardExcerpt from './excerpt';
import SiteIcon from 'blocks/site-icon';

const SitePost = ( { post, site, children } )=> {
	const canonicalMedia = post.canonical_media;
	let featuredAsset;
	if ( ! canonicalMedia ) {
		featuredAsset = <a className="reader-post-card__featured-image no-image" href={ post.URL }>
			<SiteIcon key="site-icon" size={ 96 } site={ site } />
		</a>;
	} else {
		featuredAsset = <FeaturedImage imageUri={ canonicalMedia.src } href={ post.URL }>
			<SiteIcon key="site-icon" size={ 96 } site={ site } />
		</FeaturedImage>;
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
				<ReaderPostCardExcerpt post={ post } />
				{ children }
			</div>
		</div> );
};

SitePost.propTypes = {
	post: React.PropTypes.object.isRequired,
	site: React.PropTypes.object.isRequired
};

export default SitePost;
