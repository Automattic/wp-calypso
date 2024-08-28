import { useCallback, useState } from 'react';
import { PreSignUpUserData, SocialAuthParams } from 'calypso/lib/signup/api/type';
import { useCreateAccountMutation } from './use-create-user-mutation';
import { useErrorNotice } from './use-error-notice';

/**
 * Handle Social service authentication flow result (Google, GitHub and Apple Login)
 */
export const useHandleSocialResponse = ( flowName: string ) => {
	const [ recentSocialAuthAttemptParams, setRecentSocialAuthAttemptParams ] =
		useState< SocialAuthParams >();

	const { mutate: createAccount, data: accountCreateResponse, error } = useCreateAccountMutation();

	const notice: false | JSX.Element = useErrorNotice( {
		error,
		recentSocialAuthAttemptParams,
	} );

	/**
	 * Handle Social service authentication flow result (OAuth2 or OpenID Connect)
	 * @param service      The name of the social service
	 * @param access_token An OAuth2 access token
	 * @param id_token     (Optional) a JWT id_token which contains the signed user info
	 *                              So our server doesn't have to request the user profile on its end.
	 * @param  userData     (Optional) extra user information that can be used to create a new account
	 */
	const handleSocialResponse = useCallback(
		(
			service: string,
			access_token: string,
			id_token: string | null = null,
			userData: PreSignUpUserData | null
		) => {
			const query = { redirect_to: '' };
			const storedRedirectTo = window.sessionStorage.getItem( 'signup_redirect_to' );

			if ( storedRedirectTo ) {
				query.redirect_to = storedRedirectTo;
				window.sessionStorage.removeItem( 'signup_redirect_to' );
			}

			setRecentSocialAuthAttemptParams( { service, access_token, id_token } );

			return createAccount( {
				service,
				access_token,
				id_token,
				userData,
				flowName,
				lastKnownFlow: flowName,
				recaptchaDidntLoad: false,
				recaptchaFailed: false,
				recaptchaToken: '',
			} );
		},
		[ createAccount, flowName ]
	);

	return { handleSocialResponse, notice, accountCreateResponse, recentSocialAuthAttemptParams };
};
