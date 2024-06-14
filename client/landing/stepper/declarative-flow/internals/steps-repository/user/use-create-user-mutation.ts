// import config from '@automattic/calypso-config';
// import { initGoogleRecaptcha, recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';
import { useMutation } from '@tanstack/react-query';
import { createAccount } from 'calypso/lib/signup/step-actions/create-account';
import type {
	CreateAccountParams,
	AccountCreateError,
	AccountCreateResponse,
} from 'calypso/lib/signup/api/type';

/**
 * A thin wrapper around `createAccount` to promisify and fit Stepper's data structures.
 * @param props The user props.
 * @returns a user or an error.
 */
const adaptedCreateAccount = ( { ...props }: CreateAccountParams ) => {
	return new Promise(
		(
			resolve: ( response: AccountCreateResponse ) => void,
			reject: ( errors: AccountCreateError[] ) => void
		) => {
			createAccount(
				( errors: AccountCreateError[], response: AccountCreateResponse ) =>
					errors ? reject( errors ) : resolve( response ),
				{},
				{
					...props,
					queryArgs: {},
					oauth2Signup: false,
				}
			);
		}
	);
};

export function useCreateAccountMutation() {
	return useMutation< AccountCreateResponse, Error & AccountCreateError, CreateAccountParams >( {
		mutationKey: [ 'create' ],
		mutationFn: adaptedCreateAccount,
	} );
}
