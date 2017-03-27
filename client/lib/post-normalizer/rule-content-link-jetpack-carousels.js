/**
 * External Dependencies
 */
import { forEach, get } from 'lodash';

export default function linkJetpackCarousels( post, dom ) {
	const galleries = dom.querySelectorAll( '.tiled-gallery' );

	forEach( galleries, gallery => {
		let extra = get( gallery, [ 'dataset', 'carouselExtra' ], false );
		if ( ! extra ) {
			extra = gallery.getAttribute( 'data-carousel-extra' );
			if ( ! extra ) {
				return post;
			}
		}
		let permalink;
		try {
			permalink = JSON.parse( extra ).permalink;
		} catch ( e ) {
			return post;
		}
		const links = gallery.querySelectorAll( '.tiled-gallery-item > a' );
		forEach( links, link => {
			const img = link.querySelector( 'img' );
			if ( img ) {
				const attachmentId = img.getAttribute( 'data-attachment-id' );
				if ( attachmentId ) {
					link.href = permalink + '#jp-carousel-' + attachmentId;
				}
			}
		} );
	} );
	return post;
}
