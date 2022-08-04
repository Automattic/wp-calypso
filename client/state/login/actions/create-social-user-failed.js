import { SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE } from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getErrorFromWPCOMError } from 'calypso/state/login/utils';

import 'calypso/state/login/init';

export const createSocialUserFailed = ( socialInfo, error, startingPoint ) => ( dispatch ) => {
	const wpcomError = error.field ? error : getErrorFromWPCOMError( error );

	dispatch( {
		type: SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
		authInfo: socialInfo,
		error: wpcomError,
	} );

	dispatch(
		recordTracksEvent( 'calypso_social_auth_attempt', {
			social_account_type: socialInfo.service,
			starting_point: startingPoint,
			error_code: wpcomError.code,
		} )
	);
};
