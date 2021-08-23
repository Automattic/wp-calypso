import { get } from 'lodash';

import 'calypso/state/signup/init';

const initialState = {};
export function getSignupDependencyStore( state ) {
	return get( state, 'signup.dependencyStore', initialState );
}
