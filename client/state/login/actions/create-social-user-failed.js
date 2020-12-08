/**
 * Internal dependencies
 */
import { SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE } from 'calypso/state/action-types';
import { getErrorFromWPCOMError } from 'calypso/state/login/utils';

import 'calypso/state/login/init';

export const createSocialUserFailed = ( socialInfo, error ) => ( {
	type: SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
	authInfo: socialInfo,
	error: error.field ? error : getErrorFromWPCOMError( error ),
} );
