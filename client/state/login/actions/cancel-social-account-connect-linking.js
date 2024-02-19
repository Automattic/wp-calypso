import { SOCIAL_CONNECT_ACCOUNT_LINKING_CANCEL } from 'calypso/state/action-types';

import 'calypso/state/login/init';

export function cancelSocialAccountConnectLinking() {
	return {
		type: SOCIAL_CONNECT_ACCOUNT_LINKING_CANCEL,
	};
}
