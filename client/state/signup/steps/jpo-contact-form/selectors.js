/**
 * External dependencies
 */
import { get } from 'lodash';

export function getContactForm( state ) {
	return get( state, 'signup.steps.jpoContactForm', '' );
}