/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { get, includes, startsWith } from 'lodash';
import { localize } from 'i18n-calypso';
import { parse as parseUrl } from 'url';

/**
 * Internal dependencies
 */
import config, { isEnabled } from 'config';
import ExternalLink from 'components/external-link';
import LoggedOutFormBackLink from 'components/logged-out-form/back-link';
import { addQueryArgs } from 'lib/url';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';
import getCurrentRoute from 'state/selectors/get-current-route';
import { getCurrentUserId } from 'state/current-user/selectors';
import { login } from 'lib/paths';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import { resetMagicLoginRequestForm } from 'state/login/magic-login/actions';
import { isDomainConnectAuthorizePath } from 'lib/domains/utils';

export class LoginLinks extends React.Component {
	static propTypes = {
		isLoggedIn: PropTypes.bool.isRequired,
		locale: PropTypes.string.isRequired,
		oauth2Client: PropTypes.object,
		privateSite: PropTypes.bool,
		query: PropTypes.object,
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

		const loginParameters = {
			isNative: true,
			locale: this.props.locale,
			twoFactorAuthType: 'link',
		};
		const emailAddress = get( this.props, [ 'query', 'email_address' ] );
		if ( emailAddress ) {
			loginParameters.emailAddress = emailAddress;
		}
		page( login( loginParameters ) );
	};

	recordResetPasswordLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_reset_password_link_click' );
	};

	recordSignUpLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_sign_up_link_click' );
	};

	renderBackLink() {
		const redirectTo = get( this.props, [ 'query', 'redirect_to' ] );
		if ( redirectTo ) {
			const { pathname, query: redirectToQuery } = parseUrl( redirectTo, true );

			// If we are in a Domain Connect authorization flow, don't show the back link
			// since this page was loaded by a redirect from a third party service provider.
			if ( isDomainConnectAuthorizePath( redirectTo ) ) {
				return null;
			}

			// If we seem to be in a Jetpack connection flow, provide some special handling
			// so users can go back to their site rather than WordPress.com
			if ( pathname === '/jetpack/connect/authorize' && redirectToQuery.client_id ) {
				const returnToSiteUrl = addQueryArgs(
					{ client_id: redirectToQuery.client_id },
					'https://jetpack.wordpress.com/jetpack.returntosite/1/'
				);

				const { hostname } = parseUrl( redirectToQuery.site_url );
				const linkText = hostname
					? this.props.translate( 'Back to %(hostname)s', { args: { hostname } } )
					: this.props.translate( 'Back' );

				return (
					<ExternalLink className="wp-login__site-return-link" href={ returnToSiteUrl }>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ linkText }
					</ExternalLink>
				);
			}
		}

		return (
			<LoggedOutFormBackLink
				classes={ { 'logged-out-form__link-item': false } }
				oauth2Client={ this.props.oauth2Client }
				recordClick={ this.recordBackToWpcomLinkClick }
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

		// The email address from the URL (if present) is added to the login
		// parameters in this.handleMagicLoginLinkClick(). But it's left out
		// here deliberately, to ensure that if someone copies this link to
		// paste somewhere else, their email address isn't included in it.
		const loginParameters = {
			isNative: true,
			locale: this.props.locale,
			twoFactorAuthType: 'link',
		};

		return (
			<a
				href={ login( loginParameters ) }
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

	renderSignUpLink() {
		// Taken from client/layout/masterbar/logged-out.jsx
		const { currentQuery, currentRoute, pathname, translate } = this.props;

		let signupUrl = config( 'signup_url' );
		const signupFlow = get( currentQuery, 'signup_flow' );
		if (
			// Match locales like `/log-in/jetpack/es`
			startsWith( currentRoute, '/log-in/jetpack' )
		) {
			// Basic validation that we're in a valid Jetpack Authorization flow
			if (
				includes( get( currentQuery, 'redirect_to' ), '/jetpack/connect/authorize' ) &&
				includes( get( currentQuery, 'redirect_to' ), '_wp_nonce' )
			) {
				/**
				 * `log-in/jetpack/:locale` is reached as part of the Jetpack connection flow. In
				 * this case, the redirect_to will handle signups as part of the flow. Use the
				 * `redirect_to` parameter directly for signup.
				 */
				signupUrl = currentQuery.redirect_to;
			} else {
				signupUrl = '/jetpack/new';
			}
		} else if ( '/jetpack-connect' === pathname ) {
			signupUrl = '/jetpack/new';
		} else if ( signupFlow ) {
			signupUrl += '/' + signupFlow;
		}

		return (
			<a
				href={ signupUrl }
				key="sign-up-link"
				onClick={ this.recordSignUpLinkClick }
				rel="external"
			>
				{ translate( 'Create a new account' ) }
			</a>
		);
	}

	render() {
		return (
			<div className="wp-login__links">
				{ this.renderSignUpLink() }
				{ this.renderLostPhoneLink() }
				{ this.renderHelpLink() }
				{ this.renderMagicLoginLink() }
				{ this.renderResetPasswordLink() }
				{ this.renderBackLink() }
			</div>
		);
	}
}

export default connect(
	state => ( {
		currentQuery: getCurrentQueryArguments( state ),
		currentRoute: getCurrentRoute( state ),
		isLoggedIn: Boolean( getCurrentUserId( state ) ),
		oauth2Client: getCurrentOAuth2Client( state ),
		query: getCurrentQueryArguments( state ),
	} ),
	{
		recordTracksEvent,
		resetMagicLoginRequestForm,
	}
)( localize( LoginLinks ) );
