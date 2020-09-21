/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { get, includes, startsWith } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config, { isEnabled } from 'config';
import ExternalLink from 'components/external-link';
import Gridicon from 'components/gridicon';
import LoggedOutFormBackLink from 'components/logged-out-form/back-link';
import {
	isCrowdsignalOAuth2Client,
	isJetpackCloudOAuth2Client,
	isWooOAuth2Client,
} from 'lib/oauth2-clients';
import { addQueryArgs, getUrlParts } from 'lib/url';
import { getCurrentOAuth2Client } from 'state/oauth2-clients/ui/selectors';
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
		query: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		recordTracksEvent: PropTypes.func.isRequired,
		resetMagicLoginRequestForm: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string,
		isGutenboarding: PropTypes.bool.isRequired,
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

		page(
			login( {
				isNative: true,
				twoFactorAuthType: 'backup',
				isGutenboarding: this.props.isGutenboarding,
			} )
		);
	};

	handleMagicLoginLinkClick = ( event ) => {
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

		if ( this.props.currentRoute === '/log-in/jetpack' ) {
			loginParameters.twoFactorAuthType = 'jetpack/link';
		} else if ( this.props.isGutenboarding ) {
			loginParameters.twoFactorAuthType = 'new/link';
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
		if (
			isCrowdsignalOAuth2Client( this.props.oauth2Client ) ||
			isJetpackCloudOAuth2Client( this.props.oauth2Client ) ||
			this.props.isGutenboarding
		) {
			return null;
		}

		const redirectTo = this.props.query?.redirect_to;
		if ( redirectTo ) {
			const { pathname, searchParams: redirectToQuery } = getUrlParts( redirectTo );

			// If we are in a Domain Connect authorization flow, don't show the back link
			// since this page was loaded by a redirect from a third party service provider.
			if ( isDomainConnectAuthorizePath( redirectTo ) ) {
				return null;
			}

			// If we seem to be in a Jetpack connection flow, provide some special handling
			// so users can go back to their site rather than WordPress.com
			if ( pathname === '/jetpack/connect/authorize' && redirectToQuery.get( 'client_id' ) ) {
				const returnToSiteUrl = addQueryArgs(
					{ client_id: redirectToQuery.get( 'client_id' ) },
					'https://jetpack.wordpress.com/jetpack.returntosite/1/'
				);

				const { hostname } = getUrlParts( redirectToQuery.get( 'site_url' ) );
				const linkText = hostname
					? // translators: hostname is a the hostname part of the URL. eg "google.com"
					  this.props.translate( 'Back to %(hostname)s', { args: { hostname } } )
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
				href="https://wordpress.com/support/security/two-step-authentication/"
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

		// jetpack cloud cannot have users being sent to WordPress.com
		if ( isJetpackCloudOAuth2Client( this.props.oauth2Client ) ) {
			return null;
		}

		// @todo Implement a muriel version of the email login links for the WooCommerce onboarding flows
		if (
			config.isEnabled( 'woocommerce/onboarding-oauth' ) &&
			isWooOAuth2Client( this.props.oauth2Client ) &&
			this.props.wccomFrom
		) {
			return null;
		}
		if (
			config.isEnabled( 'jetpack/connect/woocommerce' ) &&
			this.props.isJetpackWooCommerceFlow
		) {
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

		if ( this.props.currentRoute === '/log-in/jetpack' ) {
			loginParameters.twoFactorAuthType = 'jetpack/link';
		} else if ( this.props.isGutenboarding ) {
			loginParameters.twoFactorAuthType = 'new/link';
		}

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

		const queryArgs = { action: 'lostpassword' };

		// If we got here coming from Jetpack Cloud login page, we want to go back
		// to it after we finish the process
		if ( isJetpackCloudOAuth2Client( this.props.oauth2Client ) ) {
			const currentUrl = new URL( window.location.href );
			currentUrl.searchParams.append( 'lostpassword_flow', true );
			queryArgs.redirect_to = currentUrl.toString();

			// This parameter tells WPCOM that we are coming from Jetpack.com,
			// so it can present the user a Lost password page that works in
			// the context of Jetpack.com.
			queryArgs.client_id = this.props.oauth2Client.id;
		}

		return (
			<a
				href={ addQueryArgs( queryArgs, login( { locale: this.props.locale } ) ) }
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
		const {
			currentQuery,
			currentRoute,
			oauth2Client,
			pathname,
			translate,
			wccomFrom,
			isGutenboarding,
			locale,
		} = this.props;

		if ( isJetpackCloudOAuth2Client( oauth2Client ) && '/log-in/authenticator' !== currentRoute ) {
			return null;
		}

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
				signupUrl = '/jetpack/connect';
			}
		} else if ( '/jetpack-connect' === pathname ) {
			signupUrl = '/jetpack/connect';
		} else if ( signupFlow ) {
			signupUrl += '/' + signupFlow;
		}

		if ( config.isEnabled( 'signup/wpcc' ) && isCrowdsignalOAuth2Client( oauth2Client ) ) {
			const oauth2Flow = 'crowdsignal';
			const redirectTo = get( currentQuery, 'redirect_to', '' );
			const oauth2Params = new URLSearchParams( {
				oauth2_client_id: oauth2Client.id,
				oauth2_redirect: redirectTo,
			} );

			signupUrl = `${ signupUrl }/${ oauth2Flow }?${ oauth2Params.toString() }`;
		}

		if (
			config.isEnabled( 'woocommerce/onboarding-oauth' ) &&
			oauth2Client &&
			isWooOAuth2Client( oauth2Client ) &&
			wccomFrom
		) {
			const redirectTo = get( currentQuery, 'redirect_to', '' );
			const oauth2Params = new URLSearchParams( {
				oauth2_client_id: oauth2Client.id,
				'wccom-from': wccomFrom,
				oauth2_redirect: redirectTo,
			} );

			signupUrl = `${ signupUrl }/wpcc?${ oauth2Params.toString() }`;
		}

		if ( isGutenboarding ) {
			const langFragment = locale && locale !== 'en' ? `/${ locale }` : '';
			signupUrl = this.props.signupUrl || '/new' + langFragment;
		}

		if ( oauth2Client && isJetpackCloudOAuth2Client( oauth2Client ) ) {
			const redirectTo = get( currentQuery, 'redirect_to', '' );
			const oauth2Params = new URLSearchParams( {
				oauth2_client_id: oauth2Client.id,
				oauth2_redirect: redirectTo,
			} );

			signupUrl = `${ signupUrl }/wpcc?${ oauth2Params.toString() }`;
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
	( state ) => ( {
		currentQuery: getCurrentQueryArguments( state ),
		currentRoute: getCurrentRoute( state ),
		isLoggedIn: Boolean( getCurrentUserId( state ) ),
		oauth2Client: getCurrentOAuth2Client( state ),
		query: getCurrentQueryArguments( state ),
		isJetpackWooCommerceFlow:
			'woocommerce-onboarding' === get( getCurrentQueryArguments( state ), 'from' ),
		wccomFrom: get( getCurrentQueryArguments( state ), 'wccom-from' ),
	} ),
	{
		recordTracksEvent,
		resetMagicLoginRequestForm,
	}
)( localize( LoginLinks ) );
