/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_DESIGN_TYPE_SET } from 'state/action-types';

import 'state/signup/init';

export function setDesignType( designType ) {
	return {
		type: SIGNUP_STEPS_DESIGN_TYPE_SET,
		designType,
	};
}
