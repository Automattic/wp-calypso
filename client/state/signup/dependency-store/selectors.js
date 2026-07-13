import 'calypso/state/signup/init';

const initialState = {};
export function getSignupDependencyStore( state ) {
	return state?.signup?.dependencyStore ?? initialState;
}

export function getSignupDependencyProgress( state ) {
	return state?.signup?.progress ?? initialState;
}
