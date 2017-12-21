/** @format */

export const getStateKey = ( siteId, postId ) => `${ siteId }-${ postId }`;

export const deconstructStateKey = key => {
	const [ siteId, postId ] = key.split( '-' );
	return { siteId: +siteId, postId: +postId };
};

export const getErrorKey = ( siteId, commentId ) => `${ siteId }-${ commentId }`;

export const commentHasLink = ( commentContent, apiSuppliedValue ) => {
	// In case API provides value for has_link, skip parsing and return it instead.
	if ( typeof apiSuppliedValue !== 'undefined' ) {
		return apiSuppliedValue;
	}

	if ( typeof DOMParser !== 'undefined' && DOMParser.prototype.parseFromString ) {
		const parser = new DOMParser();
		const commentDom = parser.parseFromString( commentContent, 'text/html' );

		return !! commentDom.getElementsByTagName( 'a' ).length;
	}

	return false;
};
