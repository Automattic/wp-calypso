import { safeLinkRe } from './utils';

export default function makeContentLinksSafe( post, dom ) {
	const links = Array.from( dom.querySelectorAll( 'a[href]' ) );
	links.forEach( ( link ) => {
		// only accept links that are to http or https sites
		if ( ! safeLinkRe.test( link.href ) ) {
			link.removeAttribute( 'href' );
		}
	} );
	return post;
}
