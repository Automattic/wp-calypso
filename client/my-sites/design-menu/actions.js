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
import layoutFocus from 'lib/layout-focus';

const debug = debugFactory( 'calypso:tailor-actions' );

export function fetchPreviewMarkup( site, slug ) {
	return function( dispatch ) {
		debug( 'fetching preview markup', site, slug );
		wpcom.undocumented().fetchPreviewMarkup( site, slug )
		.then( markup => dispatch( gotMarkup( markup ) ) );
		// TODO: handle errors
	}
}

export function gotMarkup( markup ) {
	return { type: ActionTypes.TAILOR_MARKUP_RECEIVE, markup };
}

export function clearCustomizations() {
	return { type: ActionTypes.TAILOR_CUSTOMIZATIONS_CLEAR };
}

export function updateCustomizations( customizations ) {
	return { type: ActionTypes.TAILOR_CUSTOMIZATIONS_UPDATE, customizations };
}

export function enterControl( controlId ) {
	return { type: ActionTypes.TAILOR_CONTROL_ENTER, controlId };
}

export function leaveControl() {
	return { type: ActionTypes.TAILOR_CONTROL_LEAVE };
}

export function closeDesignMenu() {
	return function( dispatch ) {
		dispatch( resetDesignTools() );
		layoutFocus.set( 'sidebar' );
	}
}

export function resetDesignTools() {
	return { type: ActionTypes.TAILOR_RESET };
}

export function customizationsSaved() {
	return { type: ActionTypes.TAILOR_CUSTOMIZATIONS_SAVED };
}

export function saveCustomizations() {
	return function( dispatch, getState ) {
		const { tailor, ui } = getState();
		const siteId = ui.selectedSiteId;
		debug( 'saving customizations', tailor.customizations );
		Object.keys( tailor.customizations ).map( id => saveCustomizationsFor( id, tailor.customizations[ id ], siteId, dispatch ) );
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
