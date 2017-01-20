/**
 * Internal dependencies
 */
import handlers from './wpcom';

/**
 * WPCOM Middleware API
 *
 * Intercepts actions requesting data provided by the
 * WordPress.com API and passes them off to the
 * appropriate handler.
 */
export const middleware = store => next => action =>
	// we won't use has( handlers, action.type )
	// here because of performance implications
	// this function is run on every dispatch
	!! handlers[ action.type ]
		? handlers[ action.type ].forEach( handler => handler( store, action ) )
		: next( action );

export default middleware;
