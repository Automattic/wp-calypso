import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize, fixMe } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { useSelector, connect } from 'react-redux';
import AppPromo from 'calypso/blocks/app-promo';
import { shouldUseMagicCode } from 'calypso/blocks/login/utils/should-use-magic-code';
import GlobalNotices from 'calypso/components/global-notices';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import Main from 'calypso/components/main';
import { isGravPoweredOAuth2Client, isStudioAppOAuth2Client } from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import OneLoginFooter from 'calypso/login/wp-login/components/one-login-footer';
import OneLoginLayout from 'calypso/login/wp-login/components/one-login-layout';
import {
	recordTracksEventWithClientId as recordTracksEvent,
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { CHECK_YOUR_EMAIL_PAGE } from 'calypso/state/login/magic-login/constants';
import {
	getLastCheckedUsernameOrEmail,
	getTwoFactorNotificationSent,
	getRedirectToSanitized,
	getRedirectToOriginal,
} from 'calypso/state/login/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getMagicLoginCurrentView from 'calypso/state/selectors/get-magic-login-current-view';
import getMagicLoginPublicToken from 'calypso/state/selectors/get-magic-login-public-token';
import getMagicLoginRequestEmailError from 'calypso/state/selectors/get-magic-login-request-email-error';
import isMagicLoginEmailRequested from 'calypso/state/selectors/is-magic-login-email-requested';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import { withEnhancers } from 'calypso/state/utils';
import GravPoweredMagicLogin from './gravatar';
import MainContentWooCoreProfiler from './main-content-woo-core-profiler';
import RequestLoginCode from './request-login-code';
import RequestLoginEmailForm from './request-login-email-form';
import './style.scss';

export const MagicLoginLocaleSuggestions = ( { path, showCheckYourEmail } ) => {
	const locale = useSelector( getCurrentLocaleSlug );

	if ( showCheckYourEmail ) {
		return null;
	}

	return <LocaleSuggestions locale={ locale } path={ path } />;
};

export const buildEnterPasswordLoginParameters = (
	{
		isJetpackLogin,
		locale,
		userEmail,
		query,
		twoFactorNotificationSent,
		redirectToOriginal,
		oauth2Client,
	},
	{ forceUsernameOnly = false } = {}
) => {
	const loginParameters = {
		isJetpack: isJetpackLogin,
		locale,
		emailAddress: userEmail,
		signupUrl: query?.signup_url,
		twoFactorAuthType: twoFactorNotificationSent?.replace( 'none', 'authenticator' ),
		redirectTo: redirectToOriginal,
		oauth2ClientId: oauth2Client?.id,
		from: query?.from,
	};

	if ( forceUsernameOnly || query?.username_only === 'true' ) {
		loginParameters.usernameOnly = true;
	}

	return loginParameters;
};

class MagicLogin extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,

		// mapped to dispatch
		recordPageView: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,

		// mapped to state
		locale: PropTypes.string.isRequired,
		query: PropTypes.object,
		showCheckYourEmail: PropTypes.bool.isRequired,
		emailRequested: PropTypes.bool.isRequired,
		twoFactorNotificationSent: PropTypes.string,
		redirectToSanitized: PropTypes.string,

		// From `localize`
		translate: PropTypes.func.isRequired,
		isWooJPC: PropTypes.bool,
	};

	state = {
		usernameOrEmail: this.props.userEmail || '',
		publicToken: this.props.publicToken,
	};

	componentDidMount() {
		this.props.recordPageView( '/log-in/link', 'Login > Link' );
	}

	componentDidUpdate() {
		const { emailRequestError, query } = this.props;

		/**
		 * If the user is not allowed to use magic links and we have auto trigger enabled,
		 * we simply show the password login form.
		 *
		 * If we don't check for auto trigger here, the normal wp.com login flow will confuse the users
		 * when they land here without the auto trigger, i.e. when they click on "Email me a login link"
		 * at wp.com/log-in
		 */
		if ( 'login_link_not_allowed' === emailRequestError?.code && query?.auto_trigger ) {
			this.onClickEnterPasswordInstead( undefined, { forceUsernameOnly: true } );
		}
	}

	onClickEnterPasswordInstead = ( event, options = {} ) => {
		event?.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_email_link_page_click_back' );

		const loginParameters = buildEnterPasswordLoginParameters( this.props, options );

		page( login( loginParameters ) );
	};

	renderLinks() {
		const {
			isJetpackLogin,
			locale,
			showCheckYourEmail,
			translate,
			query,
			twoFactorNotificationSent,
			redirectToSanitized,
			oauth2Client,
		} = this.props;

		const isA4A = query?.redirect_to?.includes( 'agencies.automattic.com/client' ) ?? false;

		if ( showCheckYourEmail ) {
			if ( isA4A ) {
				return null;
			}
			return (
				<AppPromo
					title={ translate( 'Stay logged in with the Jetpack Mobile App' ) }
					campaign="calypso-login-link-check-email"
					className="magic-link-app-promo"
					iconSize={ 32 }
					hasQRCode
					hasGetAppButton={ false }
				/>
			);
		}

		// The email address from the URL (if present) is added to the login
		// parameters in this.onClickEnterPasswordInstead(). But it's left out
		// here deliberately, to ensure that if someone copies this link to
		// paste somewhere else, their email address isn't included in it.
		const loginParameters = {
			isJetpack: isJetpackLogin,
			locale: locale,
			signupUrl: query?.signup_url,
			twoFactorAuthType: twoFactorNotificationSent?.replace( 'none', 'authenticator' ),
			redirectTo: redirectToSanitized,
			oauth2ClientId: oauth2Client?.id,
			from: query?.from,
		};

		let linkBack = translate( 'Enter a password instead' );
		if ( query?.username_only === 'true' ) {
			linkBack = translate( 'Use username and password instead' );
		}

		return (
			<>
				<OneLoginFooter
					loginLink={
						<a
							className="one-login__footer-link"
							href={ login( loginParameters ) }
							onClick={ this.onClickEnterPasswordInstead }
						>
							{ linkBack }
						</a>
					}
				/>
				{ ! oauth2Client && (
					<AppPromo
						title={ translate( 'Stay logged in with the Jetpack Mobile App' ) }
						campaign="calypso-login-link"
						className="magic-link-app-promo"
						iconSize={ 32 }
						hasQRCode
						hasGetAppButton={ false }
					/>
				) }
			</>
		);
	}

	renderTos = () => {
		const { translate } = this.props;
		const options = {
			components: {
				tosLink: (
					<a
						href={ localizeUrl( 'https://wordpress.com/tos/' ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
				privacyLink: (
					<a
						href={ localizeUrl( 'https://automattic.com/privacy/' ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		};
		const tosText = fixMe( {
			text: 'By continuing you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
			newCopy: translate(
				'By continuing you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
				options
			),
			oldCopy: translate(
				'By creating an account you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
				options
			),
		} );

		return <p className="magic-login__tos wp-login__one-login-layout-tos">{ tosText }</p>;
	};

	handlePublicTokenReceived = ( publicToken ) => {
		this.setState( { publicToken } );
	};

	render() {
		const { oauth2Client, query, translate, isWooJPC, isJetpackLogin, isFromJetpackOnboarding } =
			this.props;
		const { usernameOrEmail } = this.state;

		if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
			return <GravPoweredMagicLogin path={ this.props.path } />;
		}

		// "query?.redirect_to" is used to determine if Studio app users are creating a new account (vs. logging in)
		const isStudio = isStudioAppOAuth2Client( oauth2Client ) && query?.redirect_to;

		// If this is part of the Jetpack login flow, some steps will display a different UI
		const requestLoginEmailFormProps = {
			...( this.props.isJetpackLogin ? { flow: 'jetpack' } : {} ),
			isJetpackMagicLinkSignUpEnabled: this.props.isJetpackLogin,
			createAccountForNewUser: true,
			isFromJetpackOnboarding,
			tosComponent: this.renderTos(),
			...( isStudio
				? {
						customFormLabel: translate( 'Your email address' ),
						submitButtonLabel: translate( 'Send activation link' ),
				  }
				: {} ),
		};

		const mainContent = (
			<Main className="magic-login magic-login__request-link">
				<GlobalNotices id="notices" />

				{ isWooJPC ? (
					<MainContentWooCoreProfiler
						emailAddress={ usernameOrEmail }
						redirectTo={ this.props.redirectToSanitized }
					/>
				) : (
					<>
						{ shouldUseMagicCode( { isJetpack: isJetpackLogin } ) ? (
							<RequestLoginCode
								{ ...requestLoginEmailFormProps }
								emailRequested={ this.props.emailRequested }
								publicToken={ this.props.publicToken }
								onPublicTokenReceived={ this.handlePublicTokenReceived }
							/>
						) : (
							<RequestLoginEmailForm { ...requestLoginEmailFormProps } />
						) }
					</>
				) }

				{ this.renderLinks() }
				<MagicLoginLocaleSuggestions
					path={ this.props.path }
					showCheckYourEmail={ this.props.showCheckYourEmail }
				/>
			</Main>
		);

		return <OneLoginLayout isJetpack={ isJetpackLogin }>{ mainContent }</OneLoginLayout>;
	}
}

const mapState = ( state ) => ( {
	locale: getCurrentLocaleSlug( state ),
	query: getCurrentQueryArguments( state ),
	showCheckYourEmail: getMagicLoginCurrentView( state ) === CHECK_YOUR_EMAIL_PAGE,
	emailRequested: isMagicLoginEmailRequested( state ),
	emailRequestError: getMagicLoginRequestEmailError( state ),
	isJetpackLogin: getCurrentRoute( state )?.startsWith( '/log-in/jetpack/link' ),
	oauth2Client: getCurrentOAuth2Client( state ),
	userEmail:
		getLastCheckedUsernameOrEmail( state ) ||
		getCurrentQueryArguments( state ).email_address ||
		getInitialQueryArguments( state ).email_address,
	twoFactorNotificationSent: getTwoFactorNotificationSent( state ),
	redirectToSanitized: getRedirectToSanitized( state ),
	redirectToOriginal: getRedirectToOriginal( state ),
	isFromJetpackOnboarding:
		new URLSearchParams( getRedirectToOriginal( state )?.split( '?' )[ 1 ] ).get( 'from' ) ===
		'jetpack-onboarding',
	isWooJPC: isWooJPCFlow( state ),
	publicToken: getMagicLoginPublicToken( state ),
} );

const mapDispatch = {
	recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
	recordTracksEvent: withEnhancers( recordTracksEvent, [ enhanceWithSiteType ] ),
};

export default connect( mapState, mapDispatch )( localize( MagicLogin ) );
