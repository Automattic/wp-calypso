/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import { defaultRegistry } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import { getSavedVariations } from 'calypso/lib/abtest';
import { stringifyBody } from 'calypso/state/login/utils';
import { recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';

const { select } = defaultRegistry;

export async function fetchStripeConfiguration( requestArgs, wpcom ) {
	return wpcom.stripeConfiguration( requestArgs );
}

async function createAccountCallback( response ) {
	// Set siteId from response
	const siteIdFromResponse = response?.blog_details?.blogid;
	const siteSlugFromResponse = response?.blog_details?.site_slug;
	const { dispatch } = defaultRegistry;
	siteIdFromResponse && dispatch( 'wpcom' ).setSiteId( siteIdFromResponse );
	siteSlugFromResponse && dispatch( 'wpcom' ).setSiteSlug( siteSlugFromResponse );

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

	return await globalThis.fetch( url, {
		method: 'POST',
		redirect: 'manual',
		credentials: 'include',
		headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
		body: stringifyBody( bodyObj ),
	} );
}

export async function createAccount( { signupFlowName } ) {
	let newSiteParams = null;
	try {
		newSiteParams = JSON.parse( window.localStorage.getItem( 'siteParams' ) || '{}' );
	} catch ( err ) {
		newSiteParams = {};
	}

	const { email } = select( 'wpcom' )?.getContactInfo() ?? {};
	const siteId = select( 'wpcom' )?.getSiteId();
	const emailValue = email.value;
	const recaptchaClientId = select( 'wpcom' )?.getRecaptchaClientId();
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
		const response = await wp.undocumented().createUserAndSite(
			{
				email: emailValue,
				'g-recaptcha-error': recaptchaError,
				'g-recaptcha-response': recaptchaToken || undefined,
				is_passwordless: true,
				extra: { username_hint: blogName },
				signup_flow_name: signupFlowName,
				validate: false,
				ab_test_variations: getSavedVariations(),
				new_site_params: newSiteParams,
				should_create_site: ! siteId,
			},
			null
		);

		createAccountCallback( response );
		return response;
	} catch ( error ) {
		const errorMessage = error?.message ? getErrorMessage( error ) : error;
		throw new Error( errorMessage );
	}
}

function getErrorMessage( { error, message } ) {
	switch ( error ) {
		case 'already_taken':
		case 'already_active':
		case 'email_exists':
			return i18n.translate( 'An account with this email address already exists.' );
		default:
			return message;
	}
}
