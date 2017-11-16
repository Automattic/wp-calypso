/** @format */

export const getStateKey = ( siteId, postId ) => `${ siteId }-${ postId }`;

export const deconstructStateKey = key => {
	const [ siteId, postId ] = key.split( '-' );
	return { siteId: +siteId, postId: +postId };
};

export const getErrorKey = ( siteId, commentId ) => `${ siteId }-${ commentId }`;
