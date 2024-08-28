// import config from '@automattic/calypso-config';
// import { initGoogleRecaptcha, recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';
import { useMutation } from '@tanstack/react-query';
import { createAccount } from 'calypso/lib/signup/api/account';
import { useDispatch } from 'calypso/state';
import { LOGIN_AUTH_ACCOUNT_TYPE_REQUESTING } from 'calypso/state/action-types';
import { receiveSuccess } from 'calypso/state/data-layer/wpcom/users/auth-options';

export function useCreateAccountMutation() {
	const dispatch = useDispatch();

	return useMutation( {
		mutationKey: [ 'create' ],
		mutationFn: createAccount,
		onMutate: ( variables ) => {
			dispatch( {
				type: LOGIN_AUTH_ACCOUNT_TYPE_REQUESTING,
				usernameOrEmail: variables.userData?.email,
			} );
		},
		onSuccess: ( data ) => {
			dispatch( receiveSuccess( null, data ) );
		},
	} );
}
