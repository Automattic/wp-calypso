import { combineReducers } from '@wordpress/data';
import type { Reducer } from 'redux';
import type { ReaderTeam, ReaderAction } from './actions';

const teams: Reducer< ReaderTeam[] | null, ReaderAction > = ( state = null, action ) => {
	if ( action.type === 'FETCH_READER_TEAMS_SUCCESS' ) {
		return action.response.teams;
	}
	return state;
};

const reducer = combineReducers( {
	teams,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
