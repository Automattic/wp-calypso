/**
 * External Dependencies
 */
import React from 'react';
import { head, filter, get } from 'lodash';

/**
 * Internal Dependencies
 */
import FeaturedVideo from './featured-video';
import FeaturedImage from './featured-image';

const FeaturedAsset = ( { post } ) => {
	if ( ! post ) {
		return null;
	}

	const featuredImage = post.canonical_image;
	let featuredAsset;

	// only feature an embed if we know how to thumbnail & autoplay it
	const featuredEmbed = head( filter( post.content_embeds, ( embed ) => embed.thumbnailUrl && embed.autoplayIframe ) );

	// we only show a featured embed when all of these are true
	//   - there is no featured image on the post that's big enough to pass as the canonical image
	//   - there is an available embed
	//
	const useFeaturedEmbed = featuredEmbed &&
		( ! featuredImage || ( featuredImage !== post.featured_image && featuredImage !== get( post, 'post_thumbnail.URL' ) ) );

	featuredAsset = useFeaturedEmbed
		? <FeaturedVideo { ...featuredEmbed } videoEmbed={ featuredEmbed } />
		: <FeaturedImage imageUri={ get( featuredImage, 'uri' ) } href={ post.URL } />;

	return featuredAsset;
};

FeaturedAsset.propTypes = {
	post: React.PropTypes.object.isRequired,
};

export default FeaturedAsset;
