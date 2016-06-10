/**
 * External dependencies
 */
import debugFactory from 'debug';
import wpcom from 'lib/wp';

/**
 * Internal dependencies
 */
import * as ActionTypes from 'state/action-types';
import * as customizationSaveFunctions from './save-functions';
import { requestSitePosts } from 'state/posts/actions';

const debug = debugFactory( 'calypso:preivew-actions' );

export function fetchPreviewMarkup( site, slug, customizations ) {
	return function( dispatch ) {
		const postData = {};
		if ( customizations ) {
			if ( customizations.homePage && customizations.homePage.hasOwnProperty( 'isPageOnFront' ) ) {
				postData.show_on_front = customizations.homePage.isPageOnFront ? 'page' : 'posts';
				if ( customizations.homePage.pageOnFrontId ) {
					postData.page_on_front = customizations.homePage.pageOnFrontId;
				}
				if ( customizations.homePage.pageForPostsId ) {
					postData.page_for_posts = customizations.homePage.pageForPostsId;
				}
			}
		}
		debug( 'fetching preview markup', site, slug, customizations, 'postData', postData );
		wpcom.undocumented().fetchPreviewMarkup( site, slug, postData )
		.then( markup => dispatch( gotMarkup( site, markup ) ) );
		// TODO: handle errors
	};
}

export function gotMarkup( siteId, markup ) {
	return { type: ActionTypes.PREVIEW_MARKUP_RECEIVE, markup, siteId };
}

export function clearCustomizations( siteId ) {
	return { type: ActionTypes.PREVIEW_CUSTOMIZATIONS_CLEAR, siteId };
}

export function updateCustomizations( siteId, customizations ) {
	return { type: ActionTypes.PREVIEW_CUSTOMIZATIONS_UPDATE, customizations, siteId };
}

export function undoCustomization( siteId ) {
	return { type: ActionTypes.PREVIEW_CUSTOMIZATIONS_UNDO, siteId };
}

export function customizationsSaved( siteId ) {
	return { type: ActionTypes.PREVIEW_CUSTOMIZATIONS_SAVED, siteId };
}

export function saveCustomizations() {
	return function( dispatch, getState ) {
		if ( ! getState().preview ) {
			debug( 'no preview state to save' );
			return;
		}
		const { preview, ui } = getState();
		const siteId = ui.selectedSiteId;
		const customizations = preview[ siteId ].customizations;
		debug( 'saving customizations', customizations );
		Object.keys( customizations ).map( id => saveCustomizationsFor( id, customizations[ id ], siteId, dispatch ) );
		dispatch( customizationsSaved( siteId ) );
	}
}

function saveCustomizationsFor( id, customizations, siteId, dispatch ) {
	debug( 'saving customizations for', id );
	const saveFunction = customizationSaveFunctions[ id ];
	if ( saveFunction ) {
		return saveFunction( dispatch, customizations, siteId );
	}
	debug( 'no save function for', id );
}

export function createHomePage() {
	return function( dispatch, getState ) {
		const { preview, ui } = getState();
		const siteId = ui.selectedSiteId;
		const customizations = preview[ siteId ].customizations;
		debug( 'creating home page for site', siteId );
		wpcom.site( siteId ).addPost( { type: 'page', title: 'Home', content: '<h1>Welcome!</h1>' } )
		.then( post => {
			debug( 'home page successfully created!', post );
			debug( 'setting home page preview setting to replace existing setting', customizations.homePage );
			if ( ! customizations.homePage ) {
				customizations.homePage = { isPageOnFront: true };
			}
			customizations.homePage.pageOnFrontId = post.ID;
			dispatch( updateCustomizations( siteId, { homePage: customizations.homePage } ) );
			debug( 'refreshing page list for new home page' );
			dispatch( requestSitePosts( siteId, { type: 'page' } ) );
		} );
	}
}
