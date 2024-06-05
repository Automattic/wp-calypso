// import config from '@automattic/calypso-config';
// import { initGoogleRecaptcha, recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';

import { AuthRedirectParams, UserSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import { createAccount } from 'calypso/lib/signup/api/account';
import { errorNotice } from 'calypso/state/notices/actions';

type Props = { flowName: string; stepSubmit?: () => void };
export default function useProcessingCallbacks( { flowName, stepSubmit }: Props ) {
	const translate = useTranslate();
	const authParams = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getAuthRedirectParams(),
		[]
	);
	// const initGoogleRecaptchaCallback = () => {
	// 	initGoogleRecaptcha( 'g-recaptcha', config( 'google_recaptcha_site_key' ) ).then(
	// 		( clientId ) => {
	// 			if ( clientId === null ) {
	// 				return;
	// 			}

	// 			this.setState( { recaptchaClientId: clientId } );

	// 			this.props.saveSignupStep( {
	// 				stepName: this.props.stepName,
	// 			} );
	// 		}
	// 	);
	// };

	type SubmitProps = {
		userData: {
			password: string;
			email: string;
			extra: {
				first_name: string;
				last_name: string;
				username_hint: string;
			};
		} | null;
		service?: string;
		access_token?: string;
		id_token?: string | null;
		oauth2Signup?: boolean;
		queryArgs: AuthRedirectParams;
		form?: any;
	};

	const submitToCreateAccount = async ( {
		userData,
		oauth2Signup,
		queryArgs: { oauth2_client_id, oauth2_redirect, redirect_to },
		...rest
	}: SubmitProps ) => {
		let submittedInfo: any = {};
		if ( oauth2Signup ) {
			submittedInfo = {
				oauth2_client_id,
				oauth2_redirect,
			};
		} else if ( redirect_to ) {
			submittedInfo = {
				redirect_to,
			};
		}
		const accountCreateParams = {
			flowName,
			stepName: 'user',
			oauth2Signup,
			...userData,
			...submittedInfo,
			...rest,
		};

		await createAccount( accountCreateParams );
		stepSubmit?.();
	};

	function isOauth2RedirectValid( oauth2Redirect?: string | null ) {
		// Allow Google sign-up to work.
		// See: https://github.com/Automattic/wp-calypso/issues/49572
		if ( ! oauth2Redirect ) {
			return true;
		}

		if ( oauth2Redirect.startsWith( '/setup/wooexpress' ) ) {
			return true;
		}

		try {
			const url = new URL( oauth2Redirect );
			return url.host === 'public-api.wordpress.com';
		} catch {
			return false;
		}
	}

	/**
	 * Handle Social service authentication flow result (OAuth2 or OpenID Connect)
	 * @param {string} service      The name of the social service
	 * @param {string} access_token An OAuth2 acccess token
	 * @param {string} id_token     (Optional) a JWT id_token which contains the signed user info
	 *                              So our server doesn't have to request the user profile on its end.
	 * @param {Object} userData     (Optional) extra user information that can be used to create a new account
	 */
	const handleSocialResponse = (
		service: SubmitProps[ 'service' ],
		access_token: SubmitProps[ 'access_token' ],
		id_token: string | null = null,
		userData: SubmitProps[ 'userData' ] | null = null
	) => {
		if ( ! isOauth2RedirectValid( authParams?.oauth2_redirect ) ) {
			errorNotice( translate( 'An unexpected error occurred. Please try again later.' ) );
			return;
		}

		const query = authParams || {};
		if ( typeof window !== 'undefined' && window.sessionStorage.getItem( 'signup_redirect_to' ) ) {
			query.redirect_to = window.sessionStorage.getItem( 'signup_redirect_to' );
			window.sessionStorage.removeItem( 'signup_redirect_to' );
		}

		submitToCreateAccount( { service, access_token, id_token, userData, queryArgs: query } );
	};
	return {
		handleSocialResponse,
	};
}
