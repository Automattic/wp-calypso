/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { plugins, use } from '@wordpress/data';
import { has, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

function determinePostType( context ) {
	if ( context.path.startsWith( '/gutenberg/post/' ) ) {
		return 'post';
	}
	if ( context.path.startsWith( '/gutenberg/page/' ) ) {
		return 'page';
	}

	return context.params.customPostType;
}

//duplicated from post-editor/controller.js. We should import it from there instead
function getPostID( context ) {
	if ( ! context.params.post || 'new' === context.params.post ) {
		return null;
	}

	// both post and site are in the path
	return parseInt( context.params.post, 10 );
}

// Trying to follow the initialization steps from https://github.com/WordPress/gutenberg/blob/de2fab7b8d66eea6c1aeb4a51308d47225fc5df8/lib/client-assets.php#L260
function registerDataPlugins( userId ) {
	const storageKey = 'WP_DATA_USER_' + userId;

	use( plugins.persistence, { storageKey: storageKey } );
	use( plugins.asyncGenerator );
	use( plugins.controls );
}

export const post = ( context, next ) => {
	//see post-editor/controller.js for reference

	const uniqueDraftKey = uniqueId( 'gutenberg-draft-' );
	const postId = getPostID( context );
	const postType = determinePostType( context );
	const isDemoContent = ! postId && has( context.query, 'gutenberg-demo' );

	const unsubscribe = context.store.subscribe( () => {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );
		const userId = getCurrentUserId( state );

		if ( ! siteId ) {
			return;
		}

		unsubscribe();

		registerDataPlugins( userId );

		// Avoids initializing core-data store before data package plugins are registered in registerDataPlugins.
		const GutenbergEditor = require( 'gutenberg/editor/main' ).default;

		context.primary = (
			<GutenbergEditor { ...{ siteId, postId, postType, uniqueDraftKey, isDemoContent } } />
		);

		next();
	} );
};
