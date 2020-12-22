/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { EDITOR_START, POST_EDIT } from 'calypso/state/action-types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import WithoutIframe from './without-iframe';
import { getSiteFragment, sectionify } from 'calypso/lib/route';
import { getSiteOption } from 'calypso/state/sites/selectors';
import NavigationComponent from 'calypso/my-sites/navigation';

function determinePostType( context ) {
	if ( context.path.startsWith( '/without-iframe/post/' ) ) {
		return 'post';
	}
	if ( context.path.startsWith( '/without-iframe/page/' ) ) {
		return 'page';
	}

	return context.params.customPostType;
}

//duplicated from post-editor/controller.js. We should import it from there instead
function getPostID( context ) {
	if ( ! context.params.post || 'new' === context.params.post ) {
		return null;
	}

	if ( 'home' === context.params.post ) {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );

		return parseInt( getSiteOption( state, siteId, 'page_on_front' ), 10 );
	}

	// both post and site are in the path
	return parseInt( context.params.post, 10 );
}

function createNavigation( context ) {
	const siteFragment = getSiteFragment( context.pathname );
	let basePath = context.pathname;

	if ( siteFragment ) {
		basePath = sectionify( context.pathname );
	}

	return (
		<NavigationComponent
			path={ context.path }
			allSitesPath={ basePath }
			siteBasePath={ basePath }
		/>
	);
}

export const gutenbergWithoutIframe = ( context, next ) => {
	// See post-editor/controller.js for reference.

	const postId = getPostID( context );
	const postType = determinePostType( context );

	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	// Set postId on state.editor.postId, so components like editor revisions can read from it.
	context.store.dispatch( { type: EDITOR_START, siteId, postId } );

	// Set post type on state.posts.[ id ].type, so components like document head can read from it.
	context.store.dispatch( { type: POST_EDIT, post: { type: postType }, siteId, postId } );

	context.secondary = createNavigation( context );
	context.primary = (
		<WithoutIframe key={ postId } siteId={ siteId } postId={ postId } postType={ postType } />
	);

	return next();
};
