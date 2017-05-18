/**
 * Internal dependencies
 */
import { DELAYED_DISPATCH } from '../action-types';

export const delayedDispatch = ( { dispatch } ) => next => action => {
	if ( DELAYED_DISPATCH !== action.type ) {
		return next( action );
	}

	const {
		delay,
		payload,
	} = action;

	setTimeout( () => dispatch( payload ), delay );
};

export default delayedDispatch;
