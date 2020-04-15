/**
 * External dependencies
 */

import { some, forEach, startsWith, endsWith } from 'lodash';
import { iframeIsWhitelisted } from './utils';
import url from 'url';

/**
 * Internal Dependencies
 */

/** Given an iframe, is it okay to have it run without a sandbox?
 *
 * @param {object} iframe - the iframe to check
 * @returns {boolean} true/false if we trust the source and we know they don't work in a sandbox
 */
function doesNotNeedSandbox( iframe ) {
	const trustedHosts = [
		'spotify.com',
		'kickstarter.com',
		'soundcloud.com',
		'embed.ted.com',
		'player.twitch.tv',
	];

	const hostName = iframe.src && url.parse( iframe.src ).hostname;
	const iframeHost = hostName && hostName.toLowerCase();

	return some( trustedHosts, ( trustedHost ) => endsWith( '.' + iframeHost, '.' + trustedHost ) );
}

export default function makeEmbedsSafe( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	const iframes = dom.querySelectorAll( 'iframe' );

	forEach( iframes, function ( iframe ) {
		if ( ! startsWith( iframe.src, 'http' ) ) {
			iframe.parentNode.removeChild( iframe );
			return;
		}

		iframe.src = iframe.src.replace( /^http:/, 'https:' );

		if ( doesNotNeedSandbox( iframe ) ) {
			iframe.removeAttribute( 'sandbox' );
		} else if ( iframeIsWhitelisted( iframe ) ) {
			iframe.setAttribute( 'sandbox', 'allow-same-origin allow-scripts allow-popups' );
		} else {
			iframe.setAttribute( 'sandbox', '' );
		}
	} );

	if ( post.is_external || post.is_jetpack ) {
		const embeds = dom.querySelectorAll( 'embed,object' );

		forEach( embeds, function ( embed ) {
			embed.parentNode.removeChild( embed );
		} );
	}

	return post;
}
