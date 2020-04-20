/**
 * External dependencies
 */

import { forEach } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { domForHtml } from './utils';

const pollLinkSelectors = [
	'a[href^="http://polldaddy.com/poll/"]',
	'a[href^="https://polldaddy.com/poll/"]',
	'a[href^="http://poll.fm/"]',
	'a[href^="https://poll.fm/"]',
	'a[href^="http://survey.fm/"]',
	'a[href^="https://survey.fm/"]',
];

export default function detectPolls( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	// Crowdsignal embed markup isn't very helpfully structured, but we can look for the noscript tag,
	// which contains the information we need, and replace it with a paragraph.
	const noscripts = dom.querySelectorAll( 'noscript' );

	forEach( noscripts, ( noscript ) => {
		if ( ! noscript.firstChild ) {
			return;
		}

		// some browsers don't require this and let us query the dom inside a noscript. some do not. maybe just jsdom.
		const noscriptDom = domForHtml( noscript.innerHTML );

		const pollLink = noscriptDom.querySelector( pollLinkSelectors.join( ', ' ) );
		if ( pollLink ) {
			const pollId = pollLink.href.match(
				/https?:\/\/(polldaddy\.com\/poll|poll\.fm|survey\.fm)\/([0-9]+)/
			)[ 2 ];
			if ( pollId ) {
				const p = document.createElement( 'p' );
				p.innerHTML =
					'<a target="_blank" rel="external noopener noreferrer" href="https://poll.fm/' +
					pollId +
					'">' +
					i18n.translate( 'Take our poll' ) +
					'</a>';
				noscript.parentNode.replaceChild( p, noscript );
			}
		}
	} );

	return post;
}
