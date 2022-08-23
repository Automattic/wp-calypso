import { get } from 'lodash';

import 'calypso/state/signup/init';

export function getSuggestedUsername( state ) {
	return get( state, 'signup.optionalDependencies.suggestedUsername', '' );
}

export function getSiteAccentColor( state ) {
	return get( state, 'signup.optionalDependencies.siteAccentColor', null );
}
