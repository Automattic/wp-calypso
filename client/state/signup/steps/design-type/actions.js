/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_DESIGN_TYPE_SET } from 'calypso/state/action-types';

import 'calypso/state/signup/init';

export function setDesignType( designType ) {
	return {
		type: SIGNUP_STEPS_DESIGN_TYPE_SET,
		designType,
	};
}
