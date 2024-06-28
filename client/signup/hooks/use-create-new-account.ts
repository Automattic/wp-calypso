import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { getLocaleSlug } from 'i18n-calypso';
import { CreateWPCOMAccountParams } from 'calypso/lib/signup/api/type';
import wpcom from 'calypso/lib/wp';

interface APIResponse {
	success: boolean;
}

function mutationCreateNewAccount( {
	userData,
	flowName,
	isPasswordless,
	recaptchaDidntLoad,
	recaptchaFailed,
	recaptchaToken,
}: CreateWPCOMAccountParams ) {
	return wpcom.req.post(
		'/users/new',
		Object.assign(
			{},
			userData,
			{
				validate: false,
				signup_flow_name: flowName,
				locale: getLocaleSlug(),
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
				anon_id: getTracksAnonymousUserId(),
				is_passwordless: isPasswordless,
			},
			recaptchaDidntLoad ? { 'g-recaptcha-error': 'recaptcha_didnt_load' } : null,
			recaptchaFailed ? { 'g-recaptcha-error': 'recaptcha_failed' } : null,
			recaptchaToken ? { 'g-recaptcha-response': recaptchaToken } : null
		)
	);
}

export default function useCreateNewAccountMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, Error, CreateWPCOMAccountParams, TContext >
): UseMutationResult< APIResponse, Error, CreateWPCOMAccountParams, TContext > {
	return useMutation( {
		...options,
		mutationFn: mutationCreateNewAccount,
	} );
}
