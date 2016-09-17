import {
	has,
	invoke,
} from 'lodash';

export const handlers = {

};

export const middleware = () => next => action => {
	if ( ! has( handlers, action.type ) ) {
		return next( action );
	}

	return invoke( handlers, action.type, action );
};

export default middleware;
