/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';
import { setStore } from 'state/redux-store';
import stateCache from 'server/state-cache';
import { getNormalizedPath } from 'server/isomorphic-routing';
import initialReducer from 'state/reducer';
import { DESERIALIZE } from 'state/action-types';

// TODO: Re-use (a modified version of) client/state/initial-state#getInitialServerState here
function getInitialServerState( serializedServerState ) {
	// Bootstrapped state from a server-render
	const serverState = initialReducer( serializedServerState, { type: DESERIALIZE } );
	return pick( serverState, Object.keys( serializedServerState ) );
}

export default ( req ) => {
	let initialServerState = {};
	// We don't compare context.query against an allowed list here. Explicit allowance lists are route-specific,
	// i.e. they can be created by route-specific middleware. `getDefaultContext` is always
	// called before route-specific middleware, so it's up to the cache *writes* in server
	// render to make sure that Redux state and markup are only cached for specified query args.
	const cacheKey = getNormalizedPath( req.path, req.query );
	if ( cacheKey ) {
		const serializeCachedServerState = stateCache.get( cacheKey ) || {};
		initialServerState = getInitialServerState( serializeCachedServerState );
	}

	const reduxStore = createReduxStore( initialServerState );
	setStore( reduxStore );

	return {
		store: reduxStore,
	};
};
