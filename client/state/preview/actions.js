/**
 * External dependencies
 */
import debugFactory from 'debug';
import wpcom from 'lib/wp';

/**
 * Internal dependencies
 */
import {
	PREVIEW_MARKUP_FETCH_ERROR,
	PREVIEW_MARKUP_RECEIVE,
	PREVIEW_CUSTOMIZATIONS_CLEAR,
	PREVIEW_CUSTOMIZATIONS_UPDATE,
	PREVIEW_CUSTOMIZATIONS_UNDO,
	PREVIEW_CUSTOMIZATIONS_SAVED,
} from 'state/action-types';
import * as customizationSaveFunctions from './save-functions';

const debug = debugFactory( 'calypso:preview-actions' );

function getDataForPreview( customizations = {} ) {
	const postData = {};
	if ( customizations.homePage && customizations.homePage.hasOwnProperty( 'isPageOnFront' ) ) {
		postData.show_on_front = customizations.homePage.isPageOnFront ? 'page' : 'posts';
		if ( customizations.homePage.pageOnFrontId ) {
			postData.page_on_front = customizations.homePage.pageOnFrontId;
		}
		if ( customizations.homePage.pageForPostsId ) {
			postData.page_for_posts = customizations.homePage.pageForPostsId;
		}
	}
	return postData;
}

export function fetchPreviewMarkup( site, path, customizations ) {
	return function( dispatch ) {
		const postData = getDataForPreview( customizations );
		debug( 'fetching preview markup', site, path, customizations, 'postData', postData );
		wpcom.undocumented().fetchPreviewMarkup( site, path, postData )
		.then( markup => dispatch( gotMarkup( site, markup ) ) )
		.catch( error => {
			dispatch( {
				type: PREVIEW_MARKUP_FETCH_ERROR,
				error
			} );
		} );
	};
}

export function gotMarkup( siteId, markup ) {
	return { type: PREVIEW_MARKUP_RECEIVE, markup, siteId };
}

export function clearCustomizations( siteId ) {
	return { type: PREVIEW_CUSTOMIZATIONS_CLEAR, siteId };
}

export function updateCustomizations( siteId, customizations ) {
	return { type: PREVIEW_CUSTOMIZATIONS_UPDATE, customizations, siteId };
}

export function undoCustomization( siteId ) {
	return { type: PREVIEW_CUSTOMIZATIONS_UNDO, siteId };
}

export function customizationsSaved( siteId ) {
	return { type: PREVIEW_CUSTOMIZATIONS_SAVED, siteId };
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
	};
}

function saveCustomizationsFor( id, customizations, siteId, dispatch ) {
	debug( 'saving customizations for', id );
	const saveFunction = customizationSaveFunctions[ id ];
	if ( saveFunction ) {
		return saveFunction( dispatch, customizations, siteId );
	}
	debug( 'no save function for', id );
}
