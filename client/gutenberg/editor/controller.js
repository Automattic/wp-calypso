/** @format */

/**
 * External dependencies
 */
import React from 'react';
import config, { isEnabled } from 'config';
import { has, uniqueId } from 'lodash';
import { setLocaleData } from '@wordpress/i18n';
import request from 'superagent';

/**
 * Internal dependencies
 */
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import { getCurrentUserId } from 'state/current-user/selectors';
import { setAllSitesSelected } from 'state/ui/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { EDITOR_START } from 'state/action-types';
import { initGutenberg } from './init';

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

export const loadTranslations = async ( context, next ) => {
	const domains = [
		{
			name: 'default',
			url: 'gutenberg',
		},
	];
	if ( isEnabled( 'gutenberg/block/jetpack-preset' ) ) {
		domains.push( {
			name: 'jetpack',
			url: 'jetpack-gutenberg-blocks',
		} );
	}

	const state = context.store.getState();
	const localeSlug = getCurrentLocaleSlug( state );

	// We don't need to localize English
	if ( localeSlug === config( 'i18n_default_locale_slug' ) ) {
		return next();
	}

	const requests = domains.map( domain =>
		request.get( `https://widgets.wp.com/languages/${ domain.url }/${ localeSlug }.json` )
	);

	const data = await Promise.all( requests );

	domains.forEach( ( { name }, index ) => {
		setLocaleData( data[ index ].body, name );
	} );

	next();
};

function waitForSelectedSiteId( context ) {
	return new Promise( resolve => {
		const unsubscribe = context.store.subscribe( () => {
			const state = context.store.getState();
			const siteId = getSelectedSiteId( state );
			if ( ! siteId ) {
				return;
			}
			unsubscribe();
			resolve( siteId );
		} );
		// Trigger a `store.subscribe()` callback
		context.store.dispatch( setAllSitesSelected() );
	} );
}

export const post = async ( context, next ) => {
	//see post-editor/controller.js for reference

	const uniqueDraftKey = uniqueId( 'gutenberg-draft-' );
	const postId = getPostID( context );
	const postType = determinePostType( context );
	const isDemoContent = ! postId && has( context.query, 'gutenberg-demo' );

	let state = context.store.getState();
	let siteId = getSelectedSiteId( state );
	if ( ! siteId ) {
		siteId = await waitForSelectedSiteId( context );
		state = context.store.getState();
	}
	const siteSlug = getSelectedSiteSlug( state );
	const userId = getCurrentUserId( state );

	//set postId on state.ui.editor.postId, so components like editor revisions can read from it
	context.store.dispatch( { type: EDITOR_START, siteId, postId } );

	const GutenbergEditor = initGutenberg( userId, siteSlug );

	context.primary = (
		<GutenbergEditor { ...{ siteId, postId, postType, uniqueDraftKey, isDemoContent } } />
	);

	next();
};
