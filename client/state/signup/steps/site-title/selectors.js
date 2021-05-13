/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/signup/init';

export function getSiteTitle( state ) {
	return get( state, 'signup.steps.siteTitle', '' );
}
