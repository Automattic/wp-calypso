import {
	fromPairs,
	has,
	invoke,
} from 'lodash';

import offlineDev from './offline-dev';

export const handlers = fromPairs( offlineDev );

export const middleware = ( { dispatch, getState } ) => next => action => {
	if ( ! has( handlers, action.type ) ) {
		return next( action );
	}

	return invoke( handlers, action.type, { dispatch, getState } )( action );
};

export default middleware;
