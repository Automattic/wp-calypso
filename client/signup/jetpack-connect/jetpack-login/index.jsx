/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import MainWrapper from '../main-wrapper';
import Login from 'blocks/login';
import TwoFactorAuthentication from 'blocks/login/two-factor-authentication';
import { localize } from 'i18n-calypso';

const JetpackLogin = ( { translate, inCodeVerificationStep } ) => {
	return (
		<MainWrapper>
			<div className="jetpack-connect__login">
				<div className="jetpack-connect__login-header">
					<Gridicon icon="user-circle" size={ 64 } />
					<div>{ translate( 'You are signed out' ) }</div>
				</div>
				<div className="jetpack-connect__login-container">
					{
						inCodeVerificationStep
						? ( <TwoFactorAuthentication /> )
						: ( <Login
							title={ translate( 'Sign in to connect to WordPress.com' ) }
							legalText={ translate( 'By connecting, you agree to share details between WordPress.com and ' ) }
							>
						</Login>
						)
					}

				</div>
			</div>
		</MainWrapper>
	);
};

export default localize( JetpackLogin );
