import config from '@automattic/calypso-config';
import i18n from 'i18n-calypso';
import { recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import wp from 'calypso/lib/wp';
import { stringifyBody } from 'calypso/state/login/utils';

interface CreateAccountResponse {
	success: boolean;
	bearer_token?: string;
	username?: string;
	blog_details?: {
		blogid?: string;
	};
}

function isCreateAccountResponse( response: unknown ): response is CreateAccountResponse {
	if ( ! response ) {
		return false;
	}
	return true;
}

async function createAccountCallback( response: CreateAccountResponse ): Promise< void > {
	if ( ! response.bearer_token ) {
		return;
	}

	// Log in the user
	wp.loadToken( response.bearer_token );
	const url = 'https://wordpress.com/wp-login.php';
	const bodyObj = {
		authorization: 'Bearer ' + response.bearer_token,
		log: response.username,
	};

	await globalThis.fetch( url, {
		method: 'POST',
		redirect: 'manual',
		credentials: 'include',
		headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
		body: stringifyBody( bodyObj ),
	} );
}

export async function createAccount( {
	signupFlowName,
	email,
	siteId,
	recaptchaClientId,
}: {
	signupFlowName: string;
	email: string | undefined;
	siteId: number | undefined;
	recaptchaClientId: number | undefined;
} ): Promise< CreateAccountResponse > {
	let newSiteParams = null;
	try {
		newSiteParams = JSON.parse( window.localStorage.getItem( 'siteParams' ) || '{}' );
	} catch ( err ) {
		newSiteParams = {};
	}

	const isRecaptchaLoaded = typeof recaptchaClientId === 'number';

	let recaptchaToken = undefined;
	let recaptchaError = undefined;

	if ( isRecaptchaLoaded ) {
		recaptchaToken = await recordGoogleRecaptchaAction(
			recaptchaClientId,
			'calypso/signup/formSubmit'
		);

		if ( ! recaptchaToken ) {
			recaptchaError = 'recaptcha_failed';
		}
	} else {
		recaptchaError = 'recaptcha_didnt_load';
	}

	const blogName = newSiteParams?.blog_name;

	try {
		const response = await wp.req.post( '/users/new', {
			email,
			'g-recaptcha-error': recaptchaError,
			'g-recaptcha-response': recaptchaToken || undefined,
			is_passwordless: true,
			extra: { username_hint: blogName },
			signup_flow_name: signupFlowName,
			validate: false,
			new_site_params: newSiteParams,
			should_create_site: ! siteId,
			locale: getLocaleSlug(),
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
			tos: getToSAcceptancePayload(),
		} );

		if ( ! isCreateAccountResponse( response ) || ! response.success ) {
			throw new Error( 'Failed to create account' );
		}

		createAccountCallback( response );
		return response;
	} catch ( error ) {
		const errorMessage = ( error as Error )?.message
			? getErrorMessage( error as Error )
			: ( error as string );
		throw new Error( errorMessage );
	}
}

function getErrorMessage( { error, message }: { error?: string; message: string } ): string {
	switch ( error ) {
		case 'already_taken':
		case 'already_active':
		case 'email_exists':
			return String( i18n.translate( 'An account with this email address already exists.' ) );
		default:
			return message;
	}
}
