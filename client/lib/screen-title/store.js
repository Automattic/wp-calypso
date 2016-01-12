/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { actionTypes } from './constants';
import buildTitle from './utils';

/**
 * Module variables
 */

const initialState = {
	title: '',
	formattedTitle: '',
	options: {
		count: 0
	}
};

const setFormattedTitle = ( state ) => (
	state.set( 'formattedTitle', buildTitle(
			state.get( 'title' ),
			state.get( 'options' ) ) )
);

const TitleStore = createReducerStore( ( state, payload ) => {
	const { action } = payload;

	switch ( action.type ) {
		case actionTypes.SET_TITLE:
			return state
				.set( 'title', action.title )
				.set( 'options', fromJS( action.options || {} ) )
				.update( setFormattedTitle );

		case actionTypes.SET_COUNT:
			return state
				.setIn( [ 'options', 'count' ], action.count )
				.update( setFormattedTitle );

		default:
			return state;
	}
}, fromJS( initialState ) );

TitleStore.getState = function() {
	return TitleStore.get().toJS();
};

export default TitleStore;
