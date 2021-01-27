/**
 * External dependencies
 */
import { Provider } from 'react-redux';
import * as React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import GoogleLoginButton from 'calypso/components/social-buttons/google';
import AppleLoginButton from 'calypso/components/social-buttons/apple';
import { USER_STORE } from '../../stores/user';

const store = createReduxStore();
setStore( store );

interface Props {
	test?: boolean;
}

const LoginStep: React.FunctionComponent< Props > = () => {
	const { __ } = useI18n();

	const { createSocialAccount } = useDispatch( USER_STORE );

	const handleGoogleResponse = async ( response ) => {
		if ( ! response.getAuthResponse ) {
			return;
		}

		console.log( 'googleAuthResponse', response );

		const tokens = response.getAuthResponse();

		if ( ! tokens || ! tokens.access_token || ! tokens.id_token ) {
			return;
		}

		const result = await createSocialAccount( {
			service: 'google',
			id_token: tokens.id_token,
			access_token: tokens.access_token,
		} );

		if ( result.ok ) {
			// Nothing to do here because receiveNewUser() action
			// will cause a domino effect elsewhere where site will
			// be creted and later redirected to cart or block editor.
		}
	};

	const handleAppleResponse = async ( response ) => {
		if ( ! response.id_token ) {
			return;
		}

		const extraUserData = response.user && {
			user_name: response.user.name,
			user_email: response.user.email,
		};

		console.log( 'appleAuthResponse', response );

		const result = await createSocialAccount( {
			service: 'apple',
			id_token: tokens.id_token,
			access_token: tokens.access_token,
			...extraUserData,
		} );

		if ( result.ok ) {
			// Nothing to do here because receiveNewUser() action
			// will cause a domino effect elsewhere where site will
			// be creted and later redirected to cart or block editor.
		}
	};

	return (
		<div className="gutenboarding-page login">
			<Provider store={ store }>
				<GoogleLoginButton
					clientId={ config( 'google_oauth_client_id' ) }
					responseHandler={ handleGoogleResponse }
					// onClick={ // TODO: Tracking? See trackSocialLogin(). }
				/>
				<AppleLoginButton
					// FIX: TS issue - not sure why clientId is an invalid prop.
					clientId={ config( 'apple_oauth_client_id' ) }
					responseHandler={ handleAppleResponse }
					// onClick={ // TODO: Tracking? See trackSocialLogin(). }
				/>
			</Provider>
		</div>
	);
};

export default LoginStep;
