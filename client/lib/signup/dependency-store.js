/** @format */

/**
 * Internal dependencies
 */
import { resetSignup } from 'state/signup/actions';
import { updateDependencyStore } from 'state/signup/dependency-store/actions';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';

const SignupDependencyStore = {
	get() {
		return getSignupDependencyStore( SignupDependencyStore.reduxStore.getState() );
	},
	update( data ) {
		SignupDependencyStore.reduxStore.dispatch( updateDependencyStore( data ) );
	},
	reset() {
		SignupDependencyStore.reduxStore.dispatch( resetSignup() );
	},
	setReduxStore( reduxStore ) {
		this.reduxStore = reduxStore;
	},
};

export default SignupDependencyStore;
