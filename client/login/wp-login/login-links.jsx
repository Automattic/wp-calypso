import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getUrlParts } from '@automattic/calypso-url';
import { Gridicon, ExternalLink } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import LoggedOutFormBackLink from 'calypso/components/logged-out-form/back-link';
import { isDomainConnectAuthorizePath } from 'calypso/lib/domains/utils';
import { canDoMagicLogin, getLoginLinkPageUrl } from 'calypso/lib/login';
import {
	isCrowdsignalOAuth2Client,
	isJetpackCloudOAuth2Client,
	isA4AOAuth2Client,
	isGravPoweredOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { resetMagicLoginRequestForm } from 'calypso/state/login/magic-login/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

export class LoginLinks extends Component {
	static propTypes = {
		isLoggedIn: PropTypes.bool.isRequired,
		locale: PropTypes.string.isRequired,
		oauth2Client: PropTypes.object,
		query: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		recordTracksEvent: PropTypes.func.isRequired,
		resetMagicLoginRequestForm: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string,
		usernameOrEmail: PropTypes.string,
		isGravPoweredClient: PropTypes.bool,
		getLostPasswordLink: PropTypes.func.isRequired,
		renderSignUpLink: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.loginLinkRef = createRef();
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

		const { isGravPoweredClient, query } = this.props;

		page(
			login( {
				twoFactorAuthType: 'backup',
				// Forward the "client_id" and "redirect_to" query parameters to the backup page
				// This ensures that the signup link on the page functions properly for Gravatar powered client's users.
				...( isGravPoweredClient && {
					oauth2ClientId: query?.client_id,
					redirectTo: query?.redirect_to,
				} ),
			} )
		);
	};

	handleMagicLoginLinkClick = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_magic_login_request_click', {
			origin: 'login-links',
		} );
		this.props.resetMagicLoginRequestForm();

		// Add typed email address as a query param
		const { query, usernameOrEmail } = this.props;
		const emailAddress = usernameOrEmail || query?.email_address;
		const { pathname, search } = getUrlParts(
			addQueryArgs( { email_address: emailAddress }, event.target.href )
		);

		page( pathname + search );
	};

	recordSignUpLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_sign_up_link_click', { origin: 'login-links' } );
	};

	getLoginLinkText = () => {
		return this.props.translate( 'Email me a login link' );
	};

	renderBackLink() {
		if (
			isCrowdsignalOAuth2Client( this.props.oauth2Client ) ||
			isJetpackCloudOAuth2Client( this.props.oauth2Client ) ||
			isA4AOAuth2Client( this.props.oauth2Client ) ||
			this.props.isWhiteLogin
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

		const isGravPoweredClient = isGravPoweredOAuth2Client( this.props.oauth2Client );

		return (
			<ExternalLink
				key="help-link"
				icon={ ! isGravPoweredClient }
				onClick={ this.recordHelpLinkClick }
				target="_blank"
				href={ localizeUrl( 'https://wordpress.com/support/security/two-step-authentication/' ) }
			>
				{ isGravPoweredClient
					? this.props.translate( 'Need help logging in?' )
					: this.props.translate( 'Get help' ) }
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
		if ( ! canDoMagicLogin( this.props.twoFactorAuthType, this.props.oauth2Client ) ) {
			return null;
		}

		if ( this.props.isLoggedIn ) {
			return null;
		}

		const loginLink = getLoginLinkPageUrl( {
			locale: this.props.locale,
			currentRoute: this.props.currentRoute,
			signupUrl: this.props.query?.signup_url,
			oauth2ClientId: this.props.oauth2Client?.id,
		} );

		return (
			<a
				// Event listeners added with `onClick` are not called, because
				// page.js adds an event listener itself. By explicitely adding
				// an event listener through the ref, we can intercept the event
				// and prevent this page.js behaviour.
				// A simpler solution would have been to add rel=external or
				// rel=download, but it would have been semantically wrong.
				ref={ this.loginLinkRef }
				href={ loginLink }
				key="magic-login-link"
				data-e2e-link="magic-login-link"
			>
				{ this.getLoginLinkText() }
			</a>
		);
	}

	renderQrCodeLoginLink() {
		if ( this.props.twoFactorAuthType ) {
			return null;
		}
		if ( this.props.isLoggedIn ) {
			return null;
		}

		// Is not supported for any oauth 2 client.
		if ( this.props.oauth2Client ) {
			return null;
		}

		const loginUrl = login( {
			locale: this.props.locale,
			twoFactorAuthType: 'qr',
			redirectTo: this.props.query?.redirect_to,
			signupUrl: this.props.query?.signup_url,
		} );
		return <a href={ loginUrl }>{ this.props.translate( 'Login via the mobile app' ) }</a>;
	}

	render() {
		return (
			<div
				className={ clsx( 'wp-login__links', {
					'has-2fa-links': this.props.twoFactorAuthType,
				} ) }
			>
				{ this.props.renderSignUpLink() }
				{ this.renderLostPhoneLink() }
				{ this.renderHelpLink() }
				{ this.renderMagicLoginLink() }
				{ this.renderQrCodeLoginLink() }
				{ this.props.getLostPasswordLink() }
				{ ! config.isEnabled( 'desktop' ) && this.renderBackLink() }
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		currentRoute: getCurrentRoute( state ),
		isLoggedIn: Boolean( getCurrentUserId( state ) ),
		query: getCurrentQueryArguments( state ),
	} ),
	{
		recordTracksEvent,
		resetMagicLoginRequestForm,
	}
)( localize( LoginLinks ) );
