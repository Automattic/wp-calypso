import { get } from 'lodash';

import 'calypso/state/signup/init';

export function getUserExperience( state ) {
	return get( state, 'signup.steps.userExperience', '' );
}
