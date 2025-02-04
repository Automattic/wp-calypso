// import config from '@automattic/calypso-config';
// import { initGoogleRecaptcha, recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';
import { useMutation } from '@tanstack/react-query';
import { createAccount } from 'calypso/lib/signup/api/account';
import { useDispatch } from 'calypso/state';
import {
	SOCIAL_LOGIN_REQUEST,
	SOCIAL_LOGIN_REQUEST_FAILURE,
	SOCIAL_LOGIN_REQUEST_SUCCESS,
} from 'calypso/state/action-types';

export function useCreateAccountMutation() {
	const dispatch = useDispatch();

	return useMutation( {
		mutationKey: [ 'create' ],
		mutationFn: createAccount,
		onMutate: () => {
			dispatch( {
				type: SOCIAL_LOGIN_REQUEST,
			} );
		},
		onSuccess: ( data ) => {
			dispatch( {
				type: SOCIAL_LOGIN_REQUEST_SUCCESS,
				data: data,
			} );
		},
		onError: ( error ) => {
			dispatch( {
				type: SOCIAL_LOGIN_REQUEST_FAILURE,
				error,
			} );
		},
	} );
}
