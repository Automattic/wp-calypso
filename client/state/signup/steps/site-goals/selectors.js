import { get } from 'lodash';

import 'calypso/state/signup/init';

export function getSiteGoals( state ) {
	return get( state, 'signup.steps.siteGoals', '' );
}
