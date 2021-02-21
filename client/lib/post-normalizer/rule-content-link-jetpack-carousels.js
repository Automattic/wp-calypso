/**
 * External dependencies
 */

import { forEach, get } from 'lodash';

/**
 * The linkJetpackCarousels rule modifies all of the WordPress galleries in the content
 * to link you to their host website's carousel instead of the permalink for that specific image.
 * Based on the DOM layout for Jetpack Galleries, which are used by Jetpack sites and WordPress.com sites
 * For example,
 * Before: https://example.com/2017/03/25/my-family/img_1/
 * After: https://example.com/2017/03/25/my-family/#jp-carousel-1234
 *
 * @param  {object} post The post
 * @param  {object} dom  The DOM for the post's content
 * @returns {object}      The post, with any additions
 */
export default function linkJetpackCarousels( post, dom ) {
	const galleries = dom.querySelectorAll( '.tiled-gallery' );

	forEach( galleries, ( gallery ) => {
		let extra = get( gallery, [ 'dataset', 'carouselExtra' ], false );
		if ( ! extra ) {
			// this only really exists for jsdom. See https://github.com/tmpvar/jsdom/issues/961
			extra = gallery.getAttribute( 'data-carousel-extra' );
			if ( ! extra ) {
				// We couldn't find the extra for this gallery. While we could pull it from the post, this makes it
				// suspect that we really found a jetpack gallery. Just bail.
				return post;
			}
		}
		let permalink;
		try {
			permalink = JSON.parse( extra ).permalink;
		} catch ( e ) {
			// doesn't look like the extra was valid JSON. Maybe this isn't really a gallery? Bail.
			return post;
		}
		// find all the links and rewrite them to point to the carousel instead of the permalink
		const links = gallery.querySelectorAll( '.tiled-gallery-item > a' );
		forEach( links, ( link ) => {
			const img = link.querySelector( 'img' );
			const attachmentId = img && img.getAttribute( 'data-attachment-id' );
			if ( attachmentId ) {
				link.href = permalink + '#jp-carousel-' + attachmentId;
				link.setAttribute( 'target', '_blank' );
			}
		} );
	} );
	return post;
}
