import { get, find, trim } from 'lodash';
import striptags from 'striptags';
import { parseHtml } from 'calypso/lib/formatting';
import { formatExcerpt } from 'calypso/lib/post-normalizer/rule-create-better-excerpt';

const PREVIEW_IMAGE_WIDTH = 512;

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

	return imageUrl ? `${ imageUrl }?s=${ PREVIEW_IMAGE_WIDTH }` : null;
};

export const getPostAutoSharingOptions = ( post ) => {
	return post?.metadata?.find( ( meta ) => meta.key === '_wpas_options' )?.value;
};

export function getPostAttachedMedia( post ) {
	return getPostAutoSharingOptions( post )?.attached_media || [];
}

export function getPostImageGeneratorSettings( post ) {
	return getPostAutoSharingOptions( post )?.image_generator_settings || {};
}

export const isSocialPost = ( post ) => {
	const socialPostOptions = getPostAutoSharingOptions( post );

	if ( socialPostOptions?.version === 2 ) {
		return getPostAttachedMedia( post ).length > 0;
	}

	return Boolean( socialPostOptions?.should_upload_attached_media );
};

export function getPostCustomMedia( post ) {
	const media = [];

	// Attach media only if "Share as a social post" option is enabled.
	if ( isSocialPost( post ) ) {
		const sigImageUrl = getSigImageUrl( post );

		if ( sigImageUrl ) {
			media.push( {
				type: 'image/jpeg',
				url: sigImageUrl,
				alt: '',
			} );
		} else {
			for ( const { id, url, type } of getPostAttachedMedia( post ) ) {
				media.push( {
					type: type || post.attachments?.[ id ]?.mime_type,
					url,
					alt: '',
				} );
			}
		}
	}

	return media;
}

export function getSigImageUrl( post ) {
	const sigSettings = getPostImageGeneratorSettings( post );

	if ( sigSettings.enabled && sigSettings.token ) {
		const baseUrl = 'https://jetpack.com/redirect/?source=sigenerate&query=';

		return baseUrl + encodeURIComponent( `t=${ sigSettings.token }` );
	}
	return '';
}

export const getExcerptForPost = ( post ) => {
	if ( ! post ) {
		return null;
	}

	return trim(
		striptags(
			formatExcerpt(
				find(
					[
						post.metadata?.find( ( { key } ) => key === 'advanced_seo_description' )?.value,
						post.excerpt,
						post.content,
					],
					Boolean
				)
			)
		)
	);
};

/**
 * Returns a summary of a post, truncated approximately at the same length as our servers
 * and Facebook truncate it.
 * @param {Object} post A post object.
 * @param {Function} translate The i18n-calypso function.
 * @param {number} maxWords Approximation of the truncation logic performed by our servers.
 * @returns {string} Post summary
 */
export const getSummaryForPost = ( post, translate, maxWords = 60 ) => {
	if ( ! post ) {
		return null;
	}
	const content = trim( striptags( post.content ) );
	const words = content.split( ' ' );
	return (
		words.slice( 0, maxWords - 1 ).join( ' ' ) +
		( words.length > maxWords - 1
			? ' ' + translate( '[ more ]', { comment: 'Truncation of post content in a FB share.' } )
			: '' )
	);
};
