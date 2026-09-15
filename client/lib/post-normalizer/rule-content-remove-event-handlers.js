const eventHandlerAttribute = /^on/i;

/**
 * Strips event handler attributes from the content DOM.
 *
 * Meant to run last. The rules before it build elements out of author-controlled post data, so
 * the markup they produce has never been seen by the sanitizers that ran over the API response.
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
