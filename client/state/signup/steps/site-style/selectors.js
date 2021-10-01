import { get } from 'lodash';

import 'calypso/state/signup/init';

export function getSiteStyle( state ) {
	return get( state, 'signup.steps.siteStyle', '' );
}
