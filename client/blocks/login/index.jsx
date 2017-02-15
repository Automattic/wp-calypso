/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import LoginForm from './login-form';
import TwoFactorAuthentication from './two-factor-authentication';
import { isTwoFactorEnabled } from 'state/login/selectors';

const Login = ( {
	title,
	legalText,
	redirectLocation,
	twoFactorEnabled
} ) => {
	return twoFactorEnabled
		? ( <TwoFactorAuthentication redirectLocation={ redirectLocation } /> )
		: ( <LoginForm
			title={ title }
			legalText={ legalText }
			redirectLocation={ redirectLocation }
		/> );
};

export default connect(
	( state ) => ( {
		twoFactorEnabled: isTwoFactorEnabled( state )
	} ),
)( Login );
