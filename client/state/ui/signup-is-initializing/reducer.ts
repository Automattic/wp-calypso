import { SIGNUP_IS_INITIALIZING_SET } from 'calypso/state/action-types';
import type { Reducer } from 'redux';

const signupIsInitializing: Reducer< boolean > = ( state = false, { type, isInitializing } ) => {
	if ( type === SIGNUP_IS_INITIALIZING_SET ) {
		return isInitializing;
	}
	return state;
};

export default signupIsInitializing;
