/**
 * External dependencies
 */
import { get } from 'lodash';

export function getSummary( state ) {
	return get( state, 'signup.steps.jpoSummary', '' );
}