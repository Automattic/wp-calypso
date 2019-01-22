/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * WordPress dependencies
 */
import CalypsoifyIframe from './calypsoify-iframe';

/**
 * Internal dependencies
 */
import isCalypsoifyGutenbergEnabled from 'state/selectors/is-calypsoify-gutenberg-enabled';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

//duplicated from post-editor/controller.js. We should import it from there instead
function getPostID( context ) {
	if ( ! context.params.post || 'new' === context.params.post ) {
		return null;
	}

	// both post and site are in the path
	return parseInt( context.params.post, 10 );
}

function determinePostType( context ) {
	if ( context.path.startsWith( '/block-editor/post/' ) ) {
		return 'post';
	}
	if ( context.path.startsWith( '/block-editor/page/' ) ) {
		return 'page';
	}

	return context.params.customPostType;
}

export const redirect = ( { store: { getState } }, next ) => {
	const state = getState();
	const siteId = getSelectedSiteId( state );
	const hasGutenberg = isCalypsoifyGutenbergEnabled( state, siteId );

	if ( hasGutenberg ) {
		return next();
	}

	return page.redirect( `/post/${ getSelectedSiteSlug( state ) }` );
};

export const post = async ( context, next ) => {
	const postId = getPostID( context );
	const postType = determinePostType( context );

	//see post-editor/controller.js for reference
	context.primary = <CalypsoifyIframe postId={ postId } postType={ postType } />;

	next();
};
