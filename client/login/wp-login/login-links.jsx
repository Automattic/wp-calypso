/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import urlModule from 'url';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import { isEnabled } from 'config';
import ExternalLink from 'components/external-link';
import LoggedOutFormBackLink from 'components/logged-out-form/back-link';
import { getCurrentUserId } from 'state/current-user/selectors';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import { resetMagicLoginRequestForm } from 'state/login/magic-login/actions';
import { login } from 'lib/paths';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';

export class LoginLinks extends React.Component {
	static propTypes = {
		backTo: PropTypes.string,
		isLoggedIn: PropTypes.bool.isRequired,
		locale: PropTypes.string.isRequired,
		oauth2Client: PropTypes.object,
		privateSite: PropTypes.bool,
		recordTracksEvent: PropTypes.func.isRequired,
		resetMagicLoginRequestForm: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string,
	};

	recordBackToWpcomLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_back_to_wpcom_link_click' );
	};

	recordHelpLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_help_link_click' );
	};

	handleLostPhoneLinkClick = event => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_lost_phone_link_click' );

		page( login( { isNative: true, twoFactorAuthType: 'backup' } ) );
	};

	handleMagicLoginLinkClick = event => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_magic_login_request_click' );
		this.props.resetMagicLoginRequestForm();

		page( login( { isNative: true, locale: this.props.locale, twoFactorAuthType: 'link' } ) );
	};

	recordResetPasswordLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_reset_password_link_click' );
	};

	renderBackLink() {
		const { backTo, translate } = this.props;

		// A backTo prop may be supplied, allowing the back button href to be controlled.
		if ( backTo ) {
			const { hostname, protocol } = urlModule.parse( backTo );

			// Ensure we've got a relative URL (null) or an http[s] protocol
			// We don't want to allow `javascript:…`
			if ( null === protocol || 'http:' === protocol || 'https:' === protocol ) {
				const linkText = hostname
					? translate( 'Back to %(hostname)s', { args: { hostname } } )
					: translate( 'Back' );
				return (
					<ExternalLink href={ backTo }>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ linkText }
					</ExternalLink>
				);
			}
		}
		return (
			<LoggedOutFormBackLink
				oauth2Client={ this.props.oauth2Client }
				recordClick={ this.recordBackToWpcomLinkClick }
				classes={ { 'logged-out-form__link-item': false } }
			/>
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
			<button
				key="lost-phone-link"
				data-e2e-link="lost-phone-link"
				onClick={ this.handleLostPhoneLinkClick }
			>
				{ this.props.translate( "I can't access my phone" ) }
			</button>
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
			<a
				href={ login( { isNative: true, locale: this.props.locale, twoFactorAuthType: 'link' } ) }
				key="magic-login-link"
				data-e2e-link="magic-login-link"
				onClick={ this.handleMagicLoginLinkClick }
			>
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

const mapState = state => ( {
	isLoggedIn: Boolean( getCurrentUserId( state ) ),
	oauth2Client: getCurrentOAuth2Client( state ),
} );

const mapDispatch = {
	recordTracksEvent,
	resetMagicLoginRequestForm,
};

export default connect( mapState, mapDispatch )( localize( LoginLinks ) );
