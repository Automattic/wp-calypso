import { combineReducers } from '@wordpress/data';
import type { Action } from './actions';
import type { BlockRecipe } from './types';
import type { Reducer } from 'redux';

export const blockRecipes: Reducer< BlockRecipe[] | undefined, Action > = (
	state = [],
	action
) => {
	if ( action.type === 'RECEIVE_BLOCK_RECIPES' ) {
		return action.blockRecipes;
	}

	return state;
};

const reducer = combineReducers( { blockRecipes } );

export type State = ReturnType< typeof reducer >;

export default reducer;
