/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import config, { isEnabled } from 'config';
import ExternalLink from 'components/external-link';
import Gridicon from 'gridicons';
import { recordPageView, recordTracksEvent } from 'state/analytics/actions';
import { resetMagicLoginRequestForm } from 'state/login/magic-login/actions';
import { login } from 'lib/paths';

export class LoginFooter extends React.Component {
	static propTypes = {
		recordPageView: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		resetMagicLoginRequestForm: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string,
	};

	onMagicLoginRequestClick = event => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_magic_login_request_click' );
		this.props.resetMagicLoginRequestForm();

		page( login( { isNative: true, twoFactorAuthType: 'link' } ) );
	};

	renderHelpLink() {
		if ( ! this.props.twoFactorAuthType ) {
			return null;
		}

		return (
			<ExternalLink
				key="help-link"
				icon={ true }
				target="_blank"
				href="http://en.support.wordpress.com/security/two-step-authentication/">
				{ this.props.translate( 'Get help' ) }
			</ExternalLink>
		);
	}

	renderLostPhoneLink() {
		if ( ! this.props.twoFactorAuthType || this.props.twoFactorAuthType === 'backup' ) {
			return null;
		}

		return (
			<a href={ login( { isNative: true, twoFactorAuthType: 'backup' } ) } key="lost-phone-link">
				{ this.props.translate( "I can't access my phone" ) }
			</a>
		);
	}

	renderMagicLoginLink() {
		if ( ! isEnabled( 'login/magic-login' ) || this.props.twoFactorAuthType ) {
			return null;
		}

		return (
			<a href="#" key="magic-login-link" onClick={ this.onMagicLoginRequestClick }>
				{ this.props.translate( 'Email me a login link' ) }
			</a>
		);
	}

	renderResetPasswordLink() {
		if ( this.props.twoFactorAuthType ) {
			return null;
		}

		return (
			<a href={ config( 'login_url' ) + '?action=lostpassword' } key="lost-password-link">
				{ this.props.translate( 'Lost your password?' ) }
			</a>
		);
	}

	render() {
		return (
			<div className="wp-login__footer">
				{ this.renderLostPhoneLink() }
				{ this.renderHelpLink() }
				{ this.renderMagicLoginLink() }
				{ this.renderResetPasswordLink() }

				<a href="https://wordpress.com" key="return-to-wpcom-link">
					<Gridicon icon="arrow-left" size={ 18 } /> { this.props.translate( 'Back to WordPress.com' ) }
				</a>
			</div>
		);
	}
}

const mapDispatch = {
	recordPageView,
	recordTracksEvent,
	resetMagicLoginRequestForm,
};

export default connect( null, mapDispatch )( localize( LoginFooter ) );
