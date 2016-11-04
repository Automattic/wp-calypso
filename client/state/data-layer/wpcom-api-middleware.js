/**
 * External dependencies
 */
import {
	fromPairs,
	has,
	invoke,
} from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from './wpcom';

export const handlers = fromPairs( wpcom );

export const middleware = ( { dispatch, getState } ) => next => action => {
	if ( ! has( handlers, action.type ) ) {
		return next( action );
	}

	return invoke( handlers, action.type, { dispatch, getState } )( action );
};

export default middleware;
