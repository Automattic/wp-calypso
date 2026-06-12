import { default as apiFetchPromise } from '@wordpress/api-fetch';
import { default as wpcomRequestPromise, canAccessWpcomApis } from '../wpcom-request';
import type { APIFetchOptions } from '../shared-types';

/**
 * The Agents Manager stores all its preferences in a single blob that the
 * server read-modify-writes on every save. Two concurrent requests race on that
 * blob (last writer wins), so one partial save can revert another — e.g. a
 * trailing `router_history` write reverting `minimized`.
 *
 * To prevent that, we keep at most one request in flight and merge any saves
 * that arrive meanwhile into a single follow-up request. Saves are
 * fire-and-forget; callers don't await the result.
 */
let pending: Record< string, unknown > = {};
let inFlight = false;

function send( state: Record< string, unknown > ): Promise< unknown > {
	if ( canAccessWpcomApis() ) {
		return wpcomRequestPromise( {
			path: '/agents-manager/state',
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			body: { state },
		} );
	}
	return apiFetchPromise( {
		global: true,
		path: '/agents-manager/open-state',
		method: 'PUT',
		data: state,
	} as APIFetchOptions );
}

function flush(): void {
	if ( inFlight || Object.keys( pending ).length === 0 ) {
		return;
	}

	const state = pending;
	pending = {};
	inFlight = true;

	// Whatever the outcome, free the slot and send anything that accumulated
	// while this request was in flight.
	const done = () => {
		inFlight = false;
		flush();
	};
	send( state ).then( done, done );
}

/**
 * Persist a partial Agents Manager state to the user's preferences.
 * @param state - Object with the prefs to save (e.g. `{ agents_manager_minimized: false }`).
 */
export function persistAgentsManagerState( state: Record< string, unknown > ): void {
	Object.assign( pending, state );
	flush();
}
