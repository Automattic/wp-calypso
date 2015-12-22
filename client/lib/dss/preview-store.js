/**
 * External dependencies
 */
import debugFactory from 'debug';
import get from 'lodash/object/get'

/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { action as ActionTypes } from 'lib/dss/constants';
import createElementFromString from 'lib/media-serialization/create-element-from-string';

const debug = debugFactory( 'calypso:dss:preview-store' );
const initialState = {};

function cleanMarkup( markup ) {
	return createElementFromString( markup ).innerHTML;
}

export default createReducerStore( ( state, { action } ) => {
	switch ( action.type ) {
		case ActionTypes.DSS_RECEIVE_THEME_PREVIEW:
			const markup = get( action, 'preview.html' );
			const styles = get( action, 'preview.styles' );
			if ( ! action.themeSlug || ! markup || ! styles ) {
				debug( 'error while recieving dynamic-screenshots theme preview', action );
				break;
			}
			debug( 'saving dynamic-screenshots data for', action.themeSlug );
			return Object.assign( {}, state, { [ action.themeSlug ]: { markup: cleanMarkup( markup ), styles } } );
	}
	return state;
}, initialState );
