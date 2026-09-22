const eventHandlerAttribute = /^on/i;

/**
 * Strips event handler attributes from the content DOM.
 *
 * Must run before `detectMedia`, which copies `iframe.outerHTML` into `post.content_embeds` and
 * `post.canonical_media`; those strings are later rendered with `dangerouslySetInnerHTML`, so they
 * have to be clean by the time they are taken. Everything that runs after it therefore has to keep
 * building elements out of a fixed set of attribute names — a later rule that wrote an
 * author-controlled attribute name would slip past this one.
 * @param {Object} post The post
 * @param {Object} dom The DOM for the post's content
 * @returns {Object} The post
 */
export default function removeEventHandlers( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	Array.from( dom.querySelectorAll( '*' ) ).forEach( ( element ) => {
		element
			.getAttributeNames()
			.filter( ( name ) => eventHandlerAttribute.test( name ) )
			.forEach( ( name ) => element.removeAttribute( name ) );
	} );

	return post;
}
