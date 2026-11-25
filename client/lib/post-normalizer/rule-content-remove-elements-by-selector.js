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
	'base', // these act on the Reader page itself, not on the post
	'meta',
	'link',
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
	Array.from( elements ).forEach( removeElement );

	return post;
}

/**
 * Removes every `noscript` element.
 *
 * The rules parse content with scripting off, where a `noscript` holds markup, but the Reader
 * renders it with scripting on, where everything up to the first `</noscript>` is text. What the
 * rules check inside one is not what the browser builds, so none can be kept. Rules that read the
 * fallback content, such as `detectMedia` and `detectPolls`, have to run before this one.
 * @param {Object} post The post
 * @param {Object} dom The DOM for the post's content
 * @returns {Object} The post
 */
export function removeNoscript( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	Array.from( dom.querySelectorAll( 'noscript' ) ).forEach( removeElement );

	return post;
}
