/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import config from 'config';

/**
 * Internal dependencies
 */
import WordPressLogo from 'components/wordpress-logo';
import Button from 'components/button';

const ResetPasswordSucceeded = ( props ) => {
	const { translate } = props;

	return (
		<div className="reset-password-succeeded">
			<WordPressLogo size={ 120 } />
			<p className="reset-password-succeeded__description">
				{ translate( 'Congratulations! Your password has been reset.' ) }
			</p>
			<Button className="reset-password-succeeded__login-button" href={ config( 'login_url' ) } primary>
				{ translate( 'Log in' ) }
			</Button>
		</div>
	);
};

export default localize( ResetPasswordSucceeded );
