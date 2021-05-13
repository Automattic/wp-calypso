/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/signup/init';

export function getSuggestedUsername( state ) {
	return get( state, 'signup.optionalDependencies.suggestedUsername', '' );
}
