/**
 * @format
 */

/**
 * External dependencies
 */
import { forEach, toArray } from 'lodash';

const acceptedProtocolRe = /^https?:\/\//;

export default function makeContentLinksSafe( post, dom ) {
	const links = toArray( dom.querySelectorAll( 'a[href]' ) );
	forEach( links, link => {
		// only accept links that are to http or https sites
		if ( ! acceptedProtocolRe.test( link.href ) ) {
			link.removeAttribute( 'href' );
		}
	} );
	return post;
}
