/**
 * External dependencies
 */
import { get } from 'lodash';

export function getJPOSiteTitle( state ) {
	return get( state, 'signup.steps.jpoSiteTitle', '' );
}