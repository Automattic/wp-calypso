/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/signup/init';

export function getSuggestedUsername( state ) {
	return get( state, 'signup.optionalDependencies.suggestedUsername', '' );
}
