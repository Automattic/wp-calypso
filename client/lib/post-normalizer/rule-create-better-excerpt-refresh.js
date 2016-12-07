/**
 * External Dependencies
 */
import { forEach, trim } from 'lodash';

/**
 * Internal Dependencies
 */
import { domForHtml } from './utils';

function removeElement( element ) {
	element.parentNode && element.parentNode.removeChild( element );
}

export function formatExcerpt( content ) {
	if ( ! content ) {
		return '';
	}

	// Spin up a new DOM for the linebreak markup
	const dom = domForHtml( content );

	// Ditch any photo captions with the wp-caption-text class, styles, scripts
	forEach(
		dom.querySelectorAll( '.wp-caption-text, style, script, blockquote[class^="instagram-"], figure, table' ),
		removeElement
	);

	forEach(
		dom.querySelectorAll( 'p, br' ),
		p => {
			p.appendChild( document.createTextNode( ' ' ) );
		}
	);

	const betterExcerpt = trim( dom.textContent );
	dom.innerHTML = '';
	return betterExcerpt;
}

export default function createBetterExcerpt( post ) {
	if ( ! post || ! post.content ) {
		return post;
	}

	// Create standard excerpt for Discover
	post.excerpt_no_html = formatExcerpt( post.excerpt );

	// Create better excerpt from the main post content
	post.better_excerpt_no_html = post.better_excerpt = formatExcerpt( post.content );

	// also make a shorter excerpt...
	if ( post.better_excerpt_no_html ) {
		// replace any trailing [...] with an actual ellipsis
		let shorterExcerpt = post.better_excerpt_no_html.replace( /\[...\]\w*$/, '…' );
		// limit to 160 characters
		if ( shorterExcerpt.length > 160 ) {
			const lastSpace = shorterExcerpt.lastIndexOf( ' ', 160 );
			shorterExcerpt = shorterExcerpt.substring( 0, lastSpace ) + '…';
		}
		post.short_excerpt = shorterExcerpt;
	}

	return post;
}
