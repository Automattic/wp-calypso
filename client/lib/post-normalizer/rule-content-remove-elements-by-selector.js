/**
 * External dependencies
 */

import { forEach } from 'lodash';

/**
 * Internal Dependencies
 */

const thingsToRemove = [
	'.sharedaddy', // share daddy
	'script', // might be too late for these at this point...
	'.jp-relatedposts', // jetpack related posts
	'.jp-relatedposts-headline', // same
	'.mc4wp-form', // mailchimp 4 wp
	'.wpcnt', // wordads?
	'.OUTBRAIN',
	'.adsbygoogle',
	'form', // no form elements
	'input',
	'select',
	'button',
	'textarea',
].join( ', ' ); // make them all into one big selector

function removeElement( element ) {
	element.parentNode && element.parentNode.removeChild( element );
}

export default function sanitizeContent( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	const elements = dom.querySelectorAll( thingsToRemove );
	// using forEach because qsa doesn't return a real array
	forEach( elements, removeElement );

	return post;
}
