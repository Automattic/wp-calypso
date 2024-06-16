// import config from '@automattic/calypso-config';
// import { initGoogleRecaptcha, recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';
import { useMutation } from '@tanstack/react-query';
import { createAccount } from 'calypso/lib/signup/api/account';

export function useCreateAccountMutation() {
	return useMutation( {
		mutationKey: [ 'create' ],
		mutationFn: createAccount,
	} );
}
