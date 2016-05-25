/**
 * External Dependencies
 */
import forEach from 'lodash/forEach';

/**
 * Internal Dependencies
 */
import { decodeEntities } from 'lib/formatting';
import i18n from 'lib/mixins/i18n';

export default function detectPolls( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	// Polldaddy embed markup isn't very helpfully structured, but we can look for the noscript tag,
	// which contains the information we need, and replace it with a paragraph.
	let noscripts = dom.querySelectorAll( 'noscript' );

	forEach( noscripts, noscript => {
		if ( ! noscript.firstChild ) {
			return;
		}
		let firstChildData = decodeEntities( noscript.firstChild.data );
		let match = firstChildData.match( '^<a href="http:\/\/polldaddy.com\/poll\/([0-9]+)' );
		if ( match ) {
			let p = document.createElement( 'p' );
			p.innerHTML = '<a rel="external" target="_blank" href="http://polldaddy.com/poll/' + match[1] + '">' + i18n.translate( 'Take our poll' ) + '</a>';
			noscript.parentNode.replaceChild( p, noscript );
		}
	} );

	return post;
}
