/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import config from 'config';
import page from 'page';

/**
 * Internal dependencies
 */
import WordPressLogo from 'components/wordpress-logo';
import Button from 'components/button';

class ResetPasswordSucceeded extends Component {
	redirectToLoginPage = () => {
		page.redirect( config( 'login_url' ) );
	}

	render() {
		const { translate } = this.props;

		return (
			<div className="reset-password-succeeded">
				<WordPressLogo size={ 120 } />
				<p className="reset-password-succeeded__description">
					{ translate( 'Congratulations! Your password has been reset.' ) }
				</p>
				<Button className="reset-password-succeeded__login-button" onClick={ this.redirectToLoginPage } primary>
					{ translate( 'Log in' ) }
				</Button>
			</div>
		);
	}
}

export default localize( ResetPasswordSucceeded );
