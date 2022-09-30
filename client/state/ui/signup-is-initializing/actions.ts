import { SIGNUP_IS_INITIALIZING_SET } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

export function setSignupIsInitializing( isInitializing: boolean ) {
	return {
		type: SIGNUP_IS_INITIALIZING_SET,
		isInitializing,
	} as const;
}
