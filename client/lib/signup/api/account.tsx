import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { recordRegistration } from 'calypso/lib/analytics/signup';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import wpcom from 'calypso/lib/wp';
import {
	AccountCreationResponse,
	CreateAccountParams,
	CreateNewAccountParams,
	CreateSocialAccountParams,
	WpcomResolvedResponse,
} from './type';

function recordNewAccountCreation( params: {
	response: AccountCreationResponse;
	flowName: string;
	username: string;
	userData: CreateAccountParams[ 'userData' ];
	signupType: 'social' | 'default';
} ) {
	const { response, flowName, userData, signupType, username } = params;
	const email = response?.email || userData?.email || userData?.user_email;
	const userId = response?.signup_sandbox_user_id || response?.user_id || userData.ID;
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

async function createSocialAccount( {
	service,
	access_token,
	id_token,
	userData,
}: CreateSocialAccountParams ) {
	const { errors, response } = await new Promise< WpcomResolvedResponse >( ( resolve ) => {
		wpcom.req.post(
			'/users/social/new',
			{
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
			},
			(
				errorDetails: { error?: string; message: string; data?: { email: string } },
				response: any
			) => {
				resolve( {
					errors: errorDetails?.error
						? [ { ...errorDetails, ...{ email: errorDetails?.data?.email } } ]
						: [],
					response,
				} );
			}
		);
	} );
	return { errors, response };
}

async function createNewAccount( {
	userData,
	flowName,
	queryArgs,
	recaptchaDidntLoad,
	recaptchaFailed,
	recaptchaToken,
	oauth2Signup,
}: CreateNewAccountParams ) {
	const { errors, response } = await new Promise< WpcomResolvedResponse >( ( resolve ) => {
		wpcom.req.post(
			'/users/new',
			Object.assign(
				{},
				userData,
				{
					validate: false,
					signup_flow_name: flowName,
					// url sent in the confirmation email
					jetpack_redirect: queryArgs.jetpack_redirect,
					locale: getLocaleSlug(),
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
					tos: getToSAcceptancePayload(),
					anon_id: getTracksAnonymousUserId(),
				},
				oauth2Signup
					? {
							oauth2_client_id: queryArgs.oauth2_client_id,
							// url of the WordPress.com authorize page for this OAuth2 client
							// convert to legacy oauth2_redirect format: %s@https://public-api.wordpress.com/oauth2/authorize/...
							oauth2_redirect: queryArgs.oauth2_redirect && '0@' + queryArgs.oauth2_redirect,
					  }
					: null,
				recaptchaDidntLoad ? { 'g-recaptcha-error': 'recaptcha_didnt_load' } : null,
				recaptchaFailed ? { 'g-recaptcha-error': 'recaptcha_failed' } : null,
				recaptchaToken ? { 'g-recaptcha-response': recaptchaToken } : null
			),
			( errorDetails: { error?: string; message: string }, response: any ) => {
				resolve( { errors: errorDetails?.error ? [ { ...errorDetails } ] : [], response } );
			}
		);
	} );
	return { errors, response };
}

export async function createAccount( {
	userData,
	flowName,
	queryArgs,
	service,
	access_token,
	id_token,
	oauth2Signup,
	recaptchaDidntLoad,
	recaptchaFailed,
	recaptchaToken,
}: CreateAccountParams ) {
	let oauth2SignupParams = {};
	let errors;
	let response: AccountCreationResponse;
	let isNewAccountCreated = true;

	if ( service ) {
		( { errors, response } = await createSocialAccount( {
			service,
			access_token,
			id_token,
			userData,
		} ) );

		isNewAccountCreated = !! response.created_account;
	} else {
		( { errors, response } = await createNewAccount( {
			userData,
			flowName,
			queryArgs,
			recaptchaDidntLoad,
			recaptchaFailed,
			recaptchaToken,
			oauth2Signup,
		} ) );
		if ( oauth2Signup ) {
			oauth2SignupParams = {
				oauth2_client_id: queryArgs.oauth2_client_id,
				oauth2_redirect: ( response.oauth2_redirect ?? '' ).split( '@' )[ 1 ],
			};
		}
	}

	if ( errors.length > 0 ) {
		return errors;
	}

	if ( ! response?.bearer_token ) {
		// something odd happened...
		// eslint-disable-next-line no-console
		console.error( 'Expected either an error or a bearer token. got %o, %o.', errors, response );
	}

	const username = response?.signup_sandbox_username || response?.username || userData.username;
	if ( isNewAccountCreated ) {
		recordNewAccountCreation( {
			response,
			flowName,
			username,
			userData,
			signupType: service ? 'social' : 'default',
		} );
	}

	return {
		username,
		...( response.bearer_token ? { bearer_token: response.bearer_token } : {} ),
		...oauth2SignupParams,
		marketing_price_group: response.marketing_price_group,
	};
}
