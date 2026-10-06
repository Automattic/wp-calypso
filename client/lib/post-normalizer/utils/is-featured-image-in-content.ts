import { getUrlParts } from '@automattic/calypso-url';
import { isPhotonHost } from 'calypso/lib/post-normalizer/utils/is-photon-host';
import { thumbIsLikelyImage } from 'calypso/lib/post-normalizer/utils/thumb-is-likely-image';

interface PostWithImages {
	post_thumbnail?: { URL?: string } | null;
	images?: Array< { src: string } >;
}

// Suffixes WordPress appends to generated copies of an upload, e.g. `photo-771x1024.jpg` or `photo-scaled.jpg`.
const WP_IMAGE_VARIANT_SUFFIX = /(?:-(?:\d+x\d+|scaled|rotated))+(?=\.[a-z0-9]+$)/i;

function getPathname( uri: string ): string {
	const { pathname, hostname } = getUrlParts( uri );
	const path = isPhotonHost( hostname )
		? pathname.substring( pathname.indexOf( '/', 1 ) )
		: pathname;

	return path.replace( WP_IMAGE_VARIANT_SUFFIX, '' );
}

/**
 * returns whether or not a posts featuredImages is contained within the contents
 * @param post - the post to check
 * @returns false if featuredImage is not within content content_images.
 *   otherwise returns the index of the dupe in post.images.
 */
export function isFeaturedImageInContent( post: PostWithImages ): false | number {
	const thumbnail = post.post_thumbnail;
	if ( thumbnail?.URL && thumbIsLikelyImage( thumbnail ) ) {
		const featuredImagePath = getPathname( thumbnail.URL );

		// skip first element in post.images because it is always the featuredImage
		const indexOfContentImage = ( post.images ?? [] ).findIndex(
			( img, i ) => i >= 1 && getPathname( img.src ) === featuredImagePath
		);

		if ( indexOfContentImage > 0 ) {
			return indexOfContentImage;
		}
	}

	return false;
}
