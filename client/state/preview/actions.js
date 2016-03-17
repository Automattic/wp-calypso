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

const debug = debugFactory( 'calypso:preivew-actions' );

export function fetchPreviewMarkup( site, slug ) {
	return function( dispatch ) {
		debug( 'fetching preview markup', site, slug );
		wpcom.undocumented().fetchPreviewMarkup( site, slug )
		.then( markup => dispatch( gotMarkup( markup ) ) );
		// TODO: handle errors
	}
}

export function gotMarkup( markup ) {
	return { type: ActionTypes.PREVIEW_MARKUP_RECEIVE, markup };
}

export function clearCustomizations() {
	return { type: ActionTypes.PREVIEW_CUSTOMIZATIONS_CLEAR };
}

export function updateCustomizations( customizations ) {
	return { type: ActionTypes.PREVIEW_CUSTOMIZATIONS_UPDATE, customizations };
}

export function undoCustomization() {
	return { type: ActionTypes.PREVIEW_CUSTOMIZATIONS_UNDO };
}

export function customizationsSaved() {
	return { type: ActionTypes.PREVIEW_CUSTOMIZATIONS_SAVED };
}

export function saveCustomizations() {
	return function( dispatch, getState ) {
		if ( ! getState().preview ) {
			debug( 'no preview state to save' );
			return;
		}
		const { preview, ui } = getState();
		const siteId = ui.selectedSiteId;
		debug( 'saving customizations', preview.customizations );
		Object.keys( preview.customizations ).map( id => saveCustomizationsFor( id, preview.customizations[ id ], siteId, dispatch ) );
		dispatch( customizationsSaved() );
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
