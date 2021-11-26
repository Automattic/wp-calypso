import {
	SIGNUP_STEPS_DIFM_SELECT_DIFM_CATEGORY,
	SIGNUP_STEPS_DIFM_SUBMIT_TYPEFORM,
} from 'calypso/state/action-types';

import 'calypso/state/signup/init';

export function selectDesignCategory( siteCategory ) {
	return {
		type: SIGNUP_STEPS_DIFM_SELECT_DIFM_CATEGORY,
		selectedDIFMCategory: siteCategory,
	};
}

export function submitDIFMLiteForm( typeformResponseId ) {
	return {
		type: SIGNUP_STEPS_DIFM_SUBMIT_TYPEFORM,
		typeformResponseId,
	};
}
