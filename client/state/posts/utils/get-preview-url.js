/**
 * Internal dependencies
 */
import { getUrlParts, getUrlFromParts } from 'calypso/lib/url';

export function getPreviewURL( site, post ) {
	let urlParts;
	let previewUrl;

	if ( ! post || ! post.URL || post.status === 'trash' ) {
		return '';
	}

	if ( post.status === 'publish' ) {
		previewUrl = post.URL;
	} else {
		urlParts = getUrlParts( post.URL );
		urlParts.searchParams.set( 'preview', 'true' );
		delete urlParts.search;
		previewUrl = getUrlFromParts( urlParts ).href;
	}

	if ( post.site_ID ) {
		if ( ! ( site && site.options ) ) {
			// site info is still loading, just use what we already have until it does
			return previewUrl;
		}
		if ( site.options.is_mapped_domain ) {
			previewUrl = previewUrl.replace( site.URL, site.options.unmapped_url );
		}
		if ( site.options.frame_nonce ) {
			urlParts = getUrlParts( previewUrl );
			urlParts.searchParams.set( 'frame-nonce', site.options.frame_nonce );
			delete urlParts.search;
			previewUrl = getUrlFromParts( urlParts ).href;
		}
	}

	return previewUrl;
}
