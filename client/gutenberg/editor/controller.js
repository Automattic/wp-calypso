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
import { isEnabled } from 'config';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import { getSiteAdminUrl } from 'state/sites/selectors';
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

		const calypsoifyGutenberg =
			isEnabled( 'gutenberg' ) &&
			isEnabled( 'gutenberg/opt-in' ) &&
			isEnabled( 'calypsoify/gutenberg' ) &&
			'gutenberg' === getSelectedEditor( state, siteId );

		if ( has( window, 'location.replace' ) && calypsoifyGutenberg ) {
			let gutenbergURL = 'post-new.php?calypsoify=1'; // Defaults to post type: `post`

			if ( isFinite( parseInt( context.params.post, 10 ) ) ) {
				// If there is a post ID, the URL ignores the post type
				gutenbergURL = `post.php?calypsoify=1&post=${ context.params.post }&action=edit`;
			} else if ( /^\/gutenberg\/page/.test( context.path ) ) {
				gutenbergURL += '&post_type=page';
			} else if ( /^\/gutenberg\/edit/.test( context.path ) ) {
				gutenbergURL += `&post_type=${ context.params.customPostType }`;
			}

			return window.location.replace( getSiteAdminUrl( state, siteId ) + gutenbergURL );
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
