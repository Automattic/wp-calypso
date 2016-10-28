/**
 * External Dependencies
 */
import forEach from 'lodash/forEach';

/**
 * Internal Dependencies
 */

const thingsToHide = [
	'.sharedaddy', // share daddy
	'script', // might be too late for these at this point...
	'.jp-relatedposts', // jetpack related posts
	'.mc4wp-form', // mailchimp 4 wp
	'.wpcnt', // wordads?
	'.OUTBRAIN',
	'.adsbygoogle',
	'form', // no form elements
	'input',
	'select',
	'button',
	'textarea'
].join( ', ' );

export default function sanitizeContent( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	const elements = dom.querySelectorAll( thingsToHide );
	forEach( elements, function( element ) {
		element.parentNode && element.parentNode.removeChild( element );
	} );

	return post;
}
