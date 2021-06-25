/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import ExternalLink from 'calypso/components/external-link';
import Gridicon from 'calypso/components/gridicon';
import LoggedOutFormBackLink from 'calypso/components/logged-out-form/back-link';
import { getSignupUrl } from 'calypso/lib/login';
import {
	isCrowdsignalOAuth2Client,
	isJetpackCloudOAuth2Client,
	isWooOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { getUrlParts } from '@automattic/calypso-url';
import { addQueryArgs } from 'calypso/lib/url';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { login, lostPassword } from 'calypso/lib/paths';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { resetMagicLoginRequestForm } from 'calypso/state/login/magic-login/actions';
import { isDomainConnectAuthorizePath } from 'calypso/lib/domains/utils';

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
		usernameOrEmail: PropTypes.string,
	};

	constructor( props ) {
		super( props );

		this.loginLinkRef = React.createRef();
	}

	componentDidMount() {
		this.loginLinkRef.current?.addEventListener( 'click', this.handleMagicLoginLinkClick );
	}

	componentWillUnmount() {
		this.loginLinkRef.current?.removeEventListener( 'click', this.handleMagicLoginLinkClick );
	}

	recordBackToWpcomLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_back_to_wpcom_link_click' );
	};

	recordHelpLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_help_link_click' );
	};

	handleLostPhoneLinkClick = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_lost_phone_link_click' );

		page( login( { twoFactorAuthType: 'backup', isGutenboarding: this.props.isGutenboarding } ) );
	};

	handleMagicLoginLinkClick = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_magic_login_request_click' );
		this.props.resetMagicLoginRequestForm();

		// Add typed email address as a query param
		const { query, usernameOrEmail } = this.props;
		const emailAddress = usernameOrEmail || query?.email_address;
		const { pathname, search } = getUrlParts(
			addQueryArgs( { email_address: emailAddress }, event.target.href )
		);

		page( pathname + search );
	};

	recordResetPasswordLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_reset_password_link_click' );
	};

	recordSignUpLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_sign_up_link_click' );
	};

	getLoginLinkPageUrl = () => {
		// The email address from the URL (if present) is added to the login
		// parameters in this.handleMagicLoginLinkClick(). But it's left out
		// here deliberately, to ensure that if someone copies this link to
		// paste somewhere else, their email address isn't included in it.
		const loginParameters = {
			locale: this.props.locale,
			twoFactorAuthType: 'link',
		};

		if ( this.props.currentRoute === '/log-in/jetpack' ) {
			loginParameters.twoFactorAuthType = 'jetpack/link';
		} else if ( this.props.isGutenboarding ) {
			loginParameters.twoFactorAuthType = 'new/link';
		}

		return login( loginParameters );
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
		if ( ! config.isEnabled( 'login/magic-login' ) || this.props.twoFactorAuthType ) {
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
		if ( isWooOAuth2Client( this.props.oauth2Client ) && this.props.wccomFrom ) {
			return null;
		}
		if ( this.props.isJetpackWooCommerceFlow ) {
			return null;
		}

		return (
			<a
				// Event listeners added with `onClick` are not called, because
				// page.js adds an event listener itself. By explicitely adding
				// an event listener through the ref, we can intercept the event
				// and prevent this page.js behaviour.
				// A simpler solution would have been to add rel=external or
				// rel=download, but it would have been semantically wrong.
				ref={ this.loginLinkRef }
				href={ this.getLoginLinkPageUrl() }
				key="magic-login-link"
				data-e2e-link="magic-login-link"
			>
				{ this.props.translate( 'Email me a login link' ) }
			</a>
		);
	}

	renderResetPasswordLink() {
		if ( this.props.twoFactorAuthType || this.props.privateSite ) {
			return null;
		}

		let lostPasswordUrl = lostPassword( { locale: this.props.locale } );

		// If we got here coming from Jetpack Cloud login page, we want to go back
		// to it after we finish the process
		if ( isJetpackCloudOAuth2Client( this.props.oauth2Client ) ) {
			const currentUrl = new URL( window.location.href );
			currentUrl.searchParams.append( 'lostpassword_flow', true );
			const queryArgs = {
				redirect_to: currentUrl.toString(),

				// This parameter tells WPCOM that we are coming from Jetpack.com,
				// so it can present the user a Lost password page that works in
				// the context of Jetpack.com.
				client_id: this.props.oauth2Client.id,
			};
			lostPasswordUrl = addQueryArgs( queryArgs, lostPasswordUrl );
		}

		return (
			<a
				href={ lostPasswordUrl }
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
			currentRoute,
			isGutenboarding,
			locale,
			oauth2Client,
			pathname,
			query,
			translate,
			usernameOrEmail,
		} = this.props;

		const signupUrl = getSignupUrl(
			query,
			currentRoute,
			oauth2Client,
			locale,
			pathname,
			isGutenboarding
		);

		if ( isJetpackCloudOAuth2Client( oauth2Client ) && '/log-in/authenticator' !== currentRoute ) {
			return null;
		}

		return (
			<a
				href={ addQueryArgs(
					{
						user_email: usernameOrEmail,
					},
					signupUrl
				) }
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
				{ ! config.isEnabled( 'desktop' ) && this.renderBackLink() }
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
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
