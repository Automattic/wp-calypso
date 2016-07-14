export function getSignupDependencyStore( state ) {
	if ( state && state.signup && state.signup.dependencyStore ) {
		return state.signup.dependencyStore;
	}

	return {};
}
