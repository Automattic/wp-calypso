/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/signup/init';

export function getDesignType( state ) {
	return get( state, 'signup.steps.designType', '' );
}
