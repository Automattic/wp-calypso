/**
 * External dependencies
 */
import { has } from 'lodash';

/**
 * Internal dependencies
 */
import handlers from './wpcom';

export const middleware = store => next => action =>
	has( handlers, action.type )
		? handlers[ action.type ].forEach( handler => handler( store, action ) )
		: next( action );

export default middleware;
