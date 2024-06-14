import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { defer, get, isEmpty } from 'lodash';
import { recordRegistration } from 'calypso/lib/analytics/signup';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import wpcom from 'calypso/lib/wp';

export function createAccount(
	callback,
	dependencies,
	{
		userData,
		flowName,
		lastKnownFlow,
		queryArgs,
		service,
		access_token,
		id_token,
		oauth2Signup,
		recaptchaDidntLoad,
		recaptchaFailed,
		recaptchaToken,
	}
) {
	const flowToCheck = flowName || lastKnownFlow;

	if ( 'onboarding-registrationless' === flowToCheck ) {
		const { cartItem, domainItem, cartItems } = dependencies;
		const isPurchasingItem =
			! isEmpty( cartItem ) || ! isEmpty( domainItem ) || ! isEmpty( cartItems );

		// If purchasing item in this flow, return without creating a user account.
		if ( isPurchasingItem ) {
			const providedDependencies = { allowUnauthenticated: true };
			return defer( () => callback( undefined, providedDependencies ) );
		}
	}

	const SIGNUP_TYPE_SOCIAL = 'social';
	const SIGNUP_TYPE_DEFAULT = 'default';

	const params = new URLSearchParams( window.location.search );
	const flowNameTracking =
		null === params.get( 'variationName' )
			? flowName
			: `${ flowName }-${ params.get( 'variationName' ) }`;

	const responseHandler = ( signupType ) => ( error, response ) => {
		const emailInError =
			signupType === SIGNUP_TYPE_SOCIAL ? { email: get( error, 'data.email', undefined ) } : {};
		const errors =
			error && error.error
				? [
						{
							error: error.error,
							message: error.message,
							...emailInError,
						},
				  ]
				: undefined;

		if ( errors ) {
			callback( errors );
			return;
		}

		// Handling special case where users log in via social using signup form.
		let newAccountCreated = true;

		if ( signupType === SIGNUP_TYPE_SOCIAL && response && ! response.created_account ) {
			newAccountCreated = false;
		}

		// we should either have an error with an error property, or we should have a response with a bearer_token
		const bearerToken = {};
		if ( response && response.bearer_token ) {
			bearerToken.bearer_token = response.bearer_token;
		} else {
			// something odd happened...
			// eslint-disable-next-line no-console
			console.error( 'Expected either an error or a bearer token. got %o, %o.', error, response );
		}

		const username =
			( response && response.signup_sandbox_username ) ||
			( response && response.username ) ||
			userData.username;

		const userId =
			( response && response.signup_sandbox_user_id ) ||
			( response && response.user_id ) ||
			userData.ID;

		const email =
			( response && response.email ) || ( userData && ( userData.email || userData.user_email ) );

		const registrationUserData = {
			ID: userId,
			username,
			email,
		};

		const marketing_price_group = response?.marketing_price_group ?? '';

		// Fire tracking events, but only after a _new_ user registers.
		if ( newAccountCreated ) {
			recordRegistration( {
				userData: registrationUserData,
				flow: flowNameTracking,
				type: signupType,
			} );
		}

		const providedDependencies = {
			username,
			marketing_price_group,
			...bearerToken,
		};

		if ( signupType === SIGNUP_TYPE_DEFAULT && oauth2Signup ) {
			Object.assign( providedDependencies, {
				oauth2_client_id: queryArgs.oauth2_client_id,
				oauth2_redirect: get( response, 'oauth2_redirect', '' ).split( '@' )[ 1 ],
			} );
		}

		callback( undefined, providedDependencies );
	};

	if ( service ) {
		// We're creating a new social account
		wpcom.req.post(
			'/users/social/new',
			{
				service,
				access_token,
				id_token,
				signup_flow_name: flowNameTracking,
				locale: getLocaleSlug(),
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
				...userData,
				tos: getToSAcceptancePayload(),
				anon_id: getTracksAnonymousUserId(),
			},
			responseHandler( SIGNUP_TYPE_SOCIAL )
		);
	} else {
		wpcom.req.post(
			'/users/new',
			Object.assign(
				{},
				userData,
				{
					validate: false,
					signup_flow_name: flowNameTracking,
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
			responseHandler( SIGNUP_TYPE_DEFAULT )
		);
	}
}
