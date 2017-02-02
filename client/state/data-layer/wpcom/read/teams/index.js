/**
 * Internal dependencies
 */
import { READER_TEAMS_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { receiveTeams as receiveTeamsAction, } from 'state/reader/teams/actions';

export function requestTeams( store, action, next ) {
	store.dispatch( http( {
		path: '/read/teams',
		method: 'GET',
		apiVersion: '1.2',
		onSuccess: action,
		onFailure: action,
		dedupe: true,
	} ) );

	next( action );
}

// TODO add in schema validation for api response
export function receiveTeams( store, action, next, teams ) {
	store.dispatch( receiveTeamsAction( { payload: teams, error: false } ) );
}

export function receiveError( store, action, next, error ) {
	store.dispatch( receiveTeamsAction( { payload: error, error: true } ) );
}

export default {
	[ READER_TEAMS_REQUEST ]: [ dispatchRequest( requestTeams, receiveTeams, receiveError ) ],
};

