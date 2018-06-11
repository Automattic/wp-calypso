/** @format */

/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_DEPENDENCY_STORE_UPDATE } from 'state/action-types';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';

const SignupDependencyStore = {
	get() {
		return getSignupDependencyStore( SignupDependencyStore.reduxStore.getState() );
	},
	update( data ) {
		SignupDependencyStore.reduxStore.dispatch( { type: SIGNUP_DEPENDENCY_STORE_UPDATE, data } );
	},
	reset() {
		SignupDependencyStore.reduxStore.dispatch( { type: SIGNUP_COMPLETE_RESET } );
	},
	setReduxStore( reduxStore ) {
		this.reduxStore = reduxStore;
	},
};

export default SignupDependencyStore;
