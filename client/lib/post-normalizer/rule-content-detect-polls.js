/**
 * External Dependencies
 */
import forEach from 'lodash/forEach';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { domForHtml } from './utils';

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

		// some browers don't require this and let us query the dom inside a noscript. some do not. maybe just jsdom.
		const noscriptDom = domForHtml( noscript.innerHTML );

		let pollLink = noscriptDom.querySelector( 'a[href^="http://polldaddy.com/poll/"]' );
		if ( pollLink ) {
			const pollId = pollLink.href.match( /https?:\/\/polldaddy.com\/poll\/([0-9]+)/ )[ 1 ];
			if ( pollId ) {
				let p = document.createElement( 'p' );
				p.innerHTML = '<a rel="external" target="_blank" href="https://polldaddy.com/poll/' + pollId + '">' + i18n.translate( 'Take our poll' ) + '</a>';
				noscript.parentNode.replaceChild( p, noscript );
			}
		}
	} );

	return post;
}
