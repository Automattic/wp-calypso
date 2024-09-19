// import config from '@automattic/calypso-config';
// import { initGoogleRecaptcha, recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';
import { useMutation } from '@tanstack/react-query';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import { createAccount } from 'calypso/lib/signup/api/account';
import { useDispatch } from 'calypso/state';
import {
	SOCIAL_LOGIN_REQUEST,
	SOCIAL_LOGIN_REQUEST_FAILURE,
	SOCIAL_LOGIN_REQUEST_SUCCESS,
} from 'calypso/state/action-types';

export function useCreateAccountMutation() {
	const dispatch = useDispatch();
	const { setIsNewUser } = useDataStoreDispatch( USER_STORE );

	return useMutation( {
		mutationKey: [ 'create' ],
		mutationFn: createAccount,
		onMutate: () => {
			dispatch( {
				type: SOCIAL_LOGIN_REQUEST,
			} );
		},
		onSuccess: ( data ) => {
			if ( 'isNewAccountCreated' in data && data.isNewAccountCreated ) {
				setIsNewUser( true );
			}
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
