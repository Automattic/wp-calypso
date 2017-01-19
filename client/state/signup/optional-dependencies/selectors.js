/**
 * External dependencies
 */
import get from 'lodash/get';

export function getSuggestedUsername( state ) {
	return get( state, 'signup.optionalDependencies.suggestedUsername', '' );
}
