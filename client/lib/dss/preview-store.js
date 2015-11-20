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

const debug = debugFactory( 'calypso:dss:preview-store' );
const initialState = {};

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
			return Object.assign( {}, state, { [ action.themeSlug ]: { markup, styles } } );
	}
	return state;
}, initialState );
