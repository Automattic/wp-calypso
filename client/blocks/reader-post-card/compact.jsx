/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';
import ReaderFeaturedVideo from 'blocks/reader-featured-video';
import ReaderFeaturedImage from 'blocks/reader-featured-image';
import ReaderExcerpt from 'blocks/reader-excerpt';
import ReaderPostOptionsMenu from 'blocks/reader-post-options-menu';

const CompactPost = ( { post, children, isDiscover } ) => {
	const canonicalMedia = post.canonical_media;
	let featuredAsset;
	if ( ! canonicalMedia ) {
		featuredAsset = null;
	} else if ( canonicalMedia.mediaType === 'video' ) {
		featuredAsset = (
			<ReaderFeaturedVideo
				{ ...canonicalMedia }
				videoEmbed={ canonicalMedia }
				allowPlaying={ false }
			/>
		);
	} else {
		featuredAsset = <ReaderFeaturedImage imageUrl={ canonicalMedia.src } href={ post.URL } />;
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="reader-post-card__post reader-post-card__compact">
			{ featuredAsset }
			<div className="reader-post-card__post-details">
				<ReaderPostOptionsMenu
					className="ignore-click"
					showFollow={ true }
					post={ post }
					position="bottom"
				/>
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
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

CompactPost.propTypes = {
	post: React.PropTypes.object.isRequired,
	isDiscover: React.PropTypes.bool,
};

export default CompactPost;
