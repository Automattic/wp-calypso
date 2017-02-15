/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import LoginForm from './login-form';
import TwoFactorAuthentication from './two-factor-authentication';
import { isTwoFactorEnabled } from 'state/login/selectors';

const Login = ( { twoFactorEnabled, translate } ) => {
	return twoFactorEnabled
		? ( <TwoFactorAuthentication /> )
		: ( <LoginForm
			title={ translate( 'Sign in to connect to WordPress.com' ) }
			legalText={ translate( 'By connecting, you agree to share details between WordPress.com and ' ) }
			redirectLocation={ '/jetpack/login' }
		/> );
};

export default connect(
	( state ) => ( {
		twoFactorEnabled: isTwoFactorEnabled( state )
	} ),
)( localize( Login ) );
