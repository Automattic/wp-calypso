/** @ssr-ready **/

/**
 * External dependencies
 */
import {
	find,
	get,
	identity
} from 'lodash';

/**
 * Internal dependencies
 */
import PostMetadata from 'lib/post-metadata';
import { formatExcerpt } from 'lib/post-normalizer/rule-create-better-excerpt';
import { parseHtml } from 'lib/formatting';

const PREVIEW_IMAGE_WIDTH = 512;

export const largeBlavatar = site => `${ get( site, 'icon.img', '//gravatar.com/avatar/' ) }?s=${ PREVIEW_IMAGE_WIDTH }`;

export const getPostImage = ( post ) => {
	if ( ! post ) {
		return null;
	}

	// Use the featured image if one was set
	if ( post.featured_image ) {
		return post.featured_image;
	}

	// Otherwise we'll look for a large enough image in the post
	const content = post.content;
	if ( ! content ) {
		return null;
	}

	const imgElements = parseHtml( content ).querySelectorAll( 'img' );
	const imageUrl = get(
		find( imgElements, ( { width } ) => width >= PREVIEW_IMAGE_WIDTH ),
		'src',
		null
	);

	return imageUrl
		? `${ imageUrl }?s=${ PREVIEW_IMAGE_WIDTH }`
		: null;
};

export const getSeoExcerptForSite = ( site ) => {
	if ( ! site ) {
		return null;
	}

	return formatExcerpt( find( [
		get( site, 'options.seo_meta_description' ),
		site.description
	], identity ) );
};

export const getSeoExcerptForPost = ( post ) => {
	if ( ! post ) {
		return null;
	}

	return formatExcerpt( find( [
		PostMetadata.metaDescription( post ),
		post.excerpt,
		post.content
	], identity ) );
};
