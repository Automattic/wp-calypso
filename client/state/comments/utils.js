/**
 * Internal dependencies
 */
import { domForHtml } from 'lib/post-normalizer/utils';

export const getStateKey = ( siteId, postId ) => `${ siteId }-${ postId }`;

export const deconstructStateKey = ( key ) => {
	const [ siteId, postId ] = key.split( '-' );
	return { siteId: +siteId, postId: +postId };
};

export const getErrorKey = ( siteId, commentId ) => `${ siteId }-${ commentId }`;

export const commentHasLink = ( commentContent, apiSuppliedValue ) => {
	// In case API provides value for has_link, skip parsing and return it instead.
	if ( typeof apiSuppliedValue !== 'undefined' ) {
		return apiSuppliedValue;
	}

	try {
		return !! domForHtml( commentContent ).getElementsByTagName( 'a' ).length;
	} catch ( e ) {
		return false;
	}
};

export const getCommentDate = ( { date } ) => new Date( date );
