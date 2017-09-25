/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import { isEnabled } from 'config';
import { addLocaleToWpcomUrl } from 'lib/i18n-utils';
import { login } from 'lib/paths';
import safeProtocolUrl from 'lib/safe-protocol-url';
import { addQueryArgs } from 'lib/url';
import { recordPageView, recordTracksEvent } from 'state/analytics/actions';
import { getCurrentUserId } from 'state/current-user/selectors';
import { resetMagicLoginRequestForm } from 'state/login/magic-login/actions';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';

export class LoginLinks extends React.Component {
	static propTypes = {
		isLoggedIn: PropTypes.bool.isRequired,
		locale: PropTypes.string.isRequired,
		privateSite: PropTypes.bool,
		recordPageView: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		resetMagicLoginRequestForm: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string,
		oauth2Client: PropTypes.object,
	};

	recordBackToWpcomLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_back_to_wpcom_link_click' );
	};

	recordHelpLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_help_link_click' );
	};

	handleLostPhoneLinkClick = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_lost_phone_link_click' );

		page( login( { isNative: true, twoFactorAuthType: 'backup' } ) );
	};

	handleMagicLoginLinkClick = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_magic_login_request_click' );
		this.props.resetMagicLoginRequestForm();

		page( login( { isNative: true, twoFactorAuthType: 'link' } ) );
	};

	recordResetPasswordLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_reset_password_link_click' );
	};

	renderBackLink() {
		const {
			locale,
			oauth2Client,
			translate,
		} = this.props;

		let url = addLocaleToWpcomUrl( 'https://wordpress.com', locale );
		let message = translate( 'Back to WordPress.com' );

		if ( oauth2Client ) {
			url = safeProtocolUrl( oauth2Client.url );
			if ( ! url || url === 'http:' ) {
				return null;
			}

			message = translate( 'Back to %(clientTitle)s', {
				args: {
					clientTitle: oauth2Client.title
				}
			} );
		}
		return (
			<a
				href={ url }
				key="return-to-wpcom-link"
				onClick={ this.recordBackToWpcomLinkClick }
				rel="external"
			>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ message }
			</a>
		);
	}

	renderHelpLink() {
		if ( ! this.props.twoFactorAuthType ) {
			return null;
		}

		return (
			<ExternalLink
				key="help-link"
				icon={ true }
				onClick={ this.recordHelpLinkClick }
				target="_blank"
				href="https://en.support.wordpress.com/security/two-step-authentication/"
			>
				{ this.props.translate( 'Get help' ) }
			</ExternalLink>
		);
	}

	renderLostPhoneLink() {
		if ( ! this.props.twoFactorAuthType || this.props.twoFactorAuthType === 'backup' ) {
			return null;
		}

		return (
			<a href="#" key="lost-phone-link" onClick={ this.handleLostPhoneLinkClick }>
				{ this.props.translate( "I can't access my phone" ) }
			</a>
		);
	}

	renderMagicLoginLink() {
		if ( ! isEnabled( 'login/magic-login' ) || this.props.twoFactorAuthType ) {
			return null;
		}

		if ( this.props.isLoggedIn ) {
			return null;
		}

		return (
			<a href="#" key="magic-login-link" onClick={ this.handleMagicLoginLinkClick }>
				{ this.props.translate( 'Email me a login link' ) }
			</a>
		);
	}

	renderResetPasswordLink() {
		if ( this.props.twoFactorAuthType || this.props.privateSite ) {
			return null;
		}

		return (
			<a
				href={ addQueryArgs( { action: 'lostpassword' }, login( { locale: this.props.locale } ) ) }
				key="lost-password-link"
				onClick={ this.recordResetPasswordLinkClick }
				rel="external"
			>
				{ this.props.translate( 'Lost your password?' ) }
			</a>
		);
	}

	render() {
		return (
			<div className="wp-login__links">
				{ this.renderLostPhoneLink() }
				{ this.renderHelpLink() }
				{ this.renderMagicLoginLink() }
				{ this.renderResetPasswordLink() }
				{ this.renderBackLink() }
			</div>
		);
	}
}

const mapState = ( state ) => ( {
	isLoggedIn: Boolean( getCurrentUserId( state ) ),
	oauth2Client: getCurrentOAuth2Client( state ),
} );

const mapDispatch = {
	recordPageView,
	recordTracksEvent,
	resetMagicLoginRequestForm,
};

export default connect( mapState, mapDispatch )( localize( LoginLinks ) );
