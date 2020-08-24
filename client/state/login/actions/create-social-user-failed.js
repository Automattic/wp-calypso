/**
 * Internal dependencies
 */
import { SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE } from 'state/action-types';
import { getErrorFromWPCOMError } from 'state/login/utils';

import 'state/login/init';

export const createSocialUserFailed = ( socialInfo, error ) => ( {
	type: SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
	authInfo: socialInfo,
	error: error.field ? error : getErrorFromWPCOMError( error ),
} );
