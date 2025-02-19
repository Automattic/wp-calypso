import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { recordRegistration } from 'calypso/lib/analytics/signup';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import wpcom from 'calypso/lib/wp';
import { setSignupIsNewUser } from 'calypso/signup/storageUtils';
import type {
	AccountCreationAPIResponse,
	CreateAccountParams,
	CreateWPCOMAccountParams,
	CreateSocialAccountParams,
} from './type';

function recordNewAccountCreation( params: {
	response: AccountCreationAPIResponse;
	flowName: string;
	username: string;
	signupType: 'social' | 'default';
} ) {
	if ( ! ( 'error' in params.response ) ) {
		const { response, flowName, signupType, username } = params;
		const email = response?.email;
		const userId = response?.signup_sandbox_user_id || response?.user_id;
		const urlParams = new URLSearchParams( window.location.search );
		const variationName = urlParams.get( 'variationName' );

		const registrationUserData = {
			ID: userId,
			username,
			email,
		};

		recordRegistration( {
			userData: registrationUserData,
			flow: variationName ? `${ flowName }-${ variationName }` : flowName,
			type: signupType,
		} );
	}
}

function createSocialAccount( {
	service,
	access_token,
	id_token,
	userData,
}: CreateSocialAccountParams ) {
	return wpcom.req.post( '/users/social/new', {
		service,
		access_token,
		id_token,
		signup_flow_name: 'TBD',
		locale: getLocaleSlug(),
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
		...userData,
		tos: getToSAcceptancePayload(),
		anon_id: getTracksAnonymousUserId(),
	} );
}

function createNewAccount( {
	userData,
	flowName,
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
				// url sent in the confirmation email
				// jetpack_redirect: queryArgs.jetpack_redirect,
				locale: getLocaleSlug(),
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
				tos: getToSAcceptancePayload(),
				anon_id: getTracksAnonymousUserId(),
			},
			recaptchaDidntLoad ? { 'g-recaptcha-error': 'recaptcha_didnt_load' } : null,
			recaptchaFailed ? { 'g-recaptcha-error': 'recaptcha_failed' } : null,
			recaptchaToken ? { 'g-recaptcha-response': recaptchaToken } : null
		)
	);
}

export async function createAccount( {
	userData,
	flowName,
	service,
	access_token,
	id_token,
	recaptchaDidntLoad,
	recaptchaFailed,
	recaptchaToken,
}: CreateAccountParams ): Promise< AccountCreationAPIResponse > {
	let response: AccountCreationAPIResponse;

	if ( service ) {
		response = await createSocialAccount( {
			service,
			access_token,
			id_token,
			userData,
		} );
	} else {
		response = await createNewAccount( {
			userData,
			flowName,
			recaptchaDidntLoad,
			recaptchaFailed,
			recaptchaToken,
		} );
	}

	// Handling special case where users log in via social using signup form.
	if (
		'error' in response ||
		( service && response && 'created_account' in response && ! response?.created_account )
	) {
		return { ...response };
	}

	const username = response?.signup_sandbox_username || response?.username;
	const userId = response?.signup_sandbox_user_id || response?.user_id;
	recordNewAccountCreation( {
		response,
		flowName,
		username,
		signupType: service ? 'social' : 'default',
	} );

	setSignupIsNewUser( userId );

	return { ...response };
}
