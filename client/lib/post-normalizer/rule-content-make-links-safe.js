/**
 * External dependencies
 */
import { forEach } from 'lodash';
import { safeLinkRe } from './utils';

export default function makeContentLinksSafe( post, dom ) {
	const links = Array.from( dom.querySelectorAll( 'a[href]' ) );
	forEach( links, ( link ) => {
		// only accept links that are to http or https sites
		if ( ! safeLinkRe.test( link.href ) ) {
			link.removeAttribute( 'href' );
		}
	} );
	return post;
}
