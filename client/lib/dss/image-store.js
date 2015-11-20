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

const debug = debugFactory( 'calypso:dss:image-store' );
const initialState = {
	isLoading: false,
	lastKey: null,
	imageResultsByKey: {}
};

export default createReducerStore( ( state, { action } ) => {
	switch ( action.type ) {
		case ActionTypes.DSS_LOADING_IMAGES:
			return Object.assign( {}, state, { isLoading: true } );

		case ActionTypes.DSS_CLEAR_IMAGES:
			debug( 'clearing dynamic-screenshots last result' );
			return Object.assign( {}, state, { isLoading: false, lastKey: null } );

		case ActionTypes.DSS_UPDATE_IMAGES:
			if ( state.imageResultsByKey[ action.searchTerm ] ) {
				return Object.assign( {}, state, { isLoading: false, lastKey: action.searchTerm } );
			}
			debug( 'tried to update dynamic-screenshots image, but no cached data found for', action.searchTerm );
			return Object.assign( {}, state, { isLoading: false } );

		case ActionTypes.DSS_RECEIVE_IMAGES:
			const images = get( action, 'data.images', [] );
			if ( images.length < 1 ) {
				// TODO: notify the user of the error
				debug( 'error getting dynamic-screenshots images', action );
				return Object.assign( {}, state, { isLoading: false } );
			}
			debug( 'saving image results for', action.searchTerm );
			const imageResultsByKey = Object.assign( {}, state.imageResultsByKey, { [ action.searchTerm ]: images[0] } );
			return Object.assign( {}, state, { isLoading: false, lastKey: action.searchTerm, imageResultsByKey } );
	}
	return state;
}, initialState );
