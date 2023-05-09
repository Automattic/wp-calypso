import { get } from 'lodash';

import 'calypso/state/signup/init';

export function getSiteTitle( state ) {
	return get( state, 'signup.steps.siteTitle', '' );
}
