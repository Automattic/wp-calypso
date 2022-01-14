import { SIGNUP_STEPS_SITE_TYPE_SET } from 'calypso/state/action-types';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';

import 'calypso/state/signup/init';

export function setSiteType( siteType ) {
	return {
		type: SIGNUP_STEPS_SITE_TYPE_SET,
		siteType,
	};
}

export function submitSiteType( siteType, stepName ) {
	return ( dispatch ) => {
		dispatch( setSiteType( siteType ) );
		dispatch( submitSignupStep( { stepName }, { siteType } ) );
	};
}
