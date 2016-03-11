/**
 * External dependencies
 */
import debugFactory from 'debug';
import wpcom from 'lib/wp';

/**
 * Internal dependencies
 */
import * as ActionTypes from 'state/action-types';

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

export function setSiteSettings( site, newSettings ) {
	return function() {
		debug( 'saving site settings:', newSettings );
		wpcom.undocumented().settings( site, 'post', newSettings, function( error, data ) {
			// TODO: handle errors, notify success
			debug( 'saving site settings complete', error, data );
		} );
	}
}

export function removeHeaderImage( site ) {
	return function() {
		debug( 'removing header image' );
		wpcom.undocumented().site( site ).removeHeaderImage( function( error, data ) {
			// TODO: handle errors, notify success
			debug( 'removing header image complete', error, data );
		} );
	}
}

export function setHeaderImage( site, url, ID, width, height ) {
	return function() {
		debug( 'setting header image', url, ID, width, height );
		wpcom.undocumented().site( site ).setHeaderImage( { url, ID, width, height }, function( error, data ) {
			// TODO: handle errors, notify success
			debug( 'setting header image complete', error, data );
		} );
	}
}

export function enterControl( controlId ) {
	return { type: ActionTypes.TAILOR_CONTROL_ENTER, controlId };
}

export function leaveControl() {
	return { type: ActionTypes.TAILOR_CONTROL_LEAVE };
}
