/**
 * External dependencies
 */

import { get } from 'lodash';

export function getDesignType( state ) {
	return get( state, 'signup.steps.designType', '' );
}
