/**
 * External dependencies
 *
 * @format
 */

import { get } from 'lodash';

export function getSuggestedUsername( state ) {
	return get( state, 'signup.optionalDependencies.suggestedUsername', '' );
}
