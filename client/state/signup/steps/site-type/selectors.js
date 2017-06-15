/**
 * External dependencies
 */
import { get } from 'lodash';

export function getSiteType( state ) {
	return get( state, 'signup.steps.siteType', '' );
}