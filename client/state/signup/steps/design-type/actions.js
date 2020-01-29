/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_DESIGN_TYPE_SET } from 'state/action-types';

export function setDesignType( designType ) {
	return {
		type: SIGNUP_STEPS_DESIGN_TYPE_SET,
		designType,
	};
}
