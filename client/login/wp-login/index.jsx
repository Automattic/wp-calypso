import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import LoginBlock from 'calypso/blocks/login';
import { getHeaderText } from 'calypso/blocks/login/login-header';
import DocumentHead from 'calypso/components/data/document-head';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import Main from 'calypso/components/main';
import isAkismetRedirect from 'calypso/lib/akismet/is-akismet-redirect';
import { getSignupUrl, pathWithLeadingSlash } from 'calypso/lib/login';
import {
	isJetpackCloudOAuth2Client,
	isA4AOAuth2Client,
	isGravPoweredOAuth2Client,
	isBlazeProOAuth2Client,
	isWooOAuth2Client,
	isPartnerPortalOAuth2Client,
	isStudioAppOAuth2Client,
	isCrowdsignalOAuth2Client,
	isVIPOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/url';
import {
	recordPageViewWithClientId as recordPageView,
	recordTracksEventWithClientId as recordTracksEvent,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { wasManualRenewalImmediateLoginAttempted } from 'calypso/state/immediate-login/selectors';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import getIsWCCOM from 'calypso/state/selectors/get-is-wccom';
import getIsWoo from 'calypso/state/selectors/get-is-woo';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import { withEnhancers } from 'calypso/state/utils';
import HeadingLogo from './components/heading-logo';
import HeadingSubText from './components/heading-subtext';
import GravPoweredLoginBlockFooter from './gravatar/grav-powered-login-block-footer';
import LoginBlockFooter from './login-block-footer';

import './style.scss';

export class Login extends Component {
	static propTypes = {
		clientId: PropTypes.string,
		isLoginView: PropTypes.bool,
		isJetpack: PropTypes.bool.isRequired,
		isWhiteLogin: PropTypes.bool.isRequired,
		locale: PropTypes.string.isRequired,
		oauth2Client: PropTypes.object,
		path: PropTypes.string.isRequired,
		recordPageView: PropTypes.func.isRequired,
		socialConnect: PropTypes.bool,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string,
		action: PropTypes.string,
		isGravPoweredClient: PropTypes.bool,
	};

	static defaultProps = { isJetpack: false, isWhiteLogin: false, isLoginView: true };

	state = {
		usernameOrEmail: '',
	};

	constructor( props ) {
		super();

		this.state.usernameOrEmail = props.emailQueryParam ?? '';
	}

	componentDidMount() {
		this.recordPageView();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.twoFactorAuthType !== prevProps.twoFactorAuthType ) {
			this.recordPageView();
		}

		if ( this.props.socialConnect !== prevProps.socialConnect ) {
			this.recordPageView();
		}
	}

	recordPageView() {
		const { socialConnect, twoFactorAuthType } = this.props;

		let url = '/log-in';
		let title = 'Login';

		if ( twoFactorAuthType ) {
			const authTypeTitle =
				twoFactorAuthType.charAt( 0 ).toUpperCase() + twoFactorAuthType.slice( 1 );
			url += `/${ twoFactorAuthType }`;
			title += ` > Two-Step Authentication > ${ authTypeTitle }`;
		}

		if ( socialConnect ) {
			url += `/${ socialConnect }`;
			title += ' > Social Connect';
		}

		this.props.recordPageView( url, title );
	}

	recordBackToWpcomLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_back_to_wpcom_link_click' );
	};

	handleUsernameChange( usernameOrEmail ) {
		this.setState( { usernameOrEmail } );
	}

	renderI18nSuggestions() {
		const { locale, path, isLoginView } = this.props;

		if ( ! isLoginView ) {
			return null;
		}

		return <LocaleSuggestions locale={ locale } path={ path } />;
	}

	recordResetPasswordLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_reset_password_link_click' );
	};

	getLostPasswordLink() {
		if ( this.props.twoFactorAuthType ) {
			return null;
		}

		return (
			<a
				className="login__lost-password-link"
				href="/"
				onClick={ ( event ) => {
					event.preventDefault();
					this.props.recordTracksEvent( 'calypso_login_reset_password_link_click' );
					page(
						login( {
							redirectTo: this.props.redirectTo,
							locale: this.props.locale,
							action:
								this.props.isWooJPC || this.props.isJetpack
									? 'jetpack/lostpassword'
									: 'lostpassword',
							oauth2ClientId: this.props.oauth2Client && this.props.oauth2Client.id,
							from: get( this.props.currentQuery, 'from' ),
						} )
					);
				} }
			>
				{ this.props.translate( 'Lost your password?' ) }
			</a>
		);
	}

	getLoginLink() {
		return (
			<a
				className="wp-login__login-block-footer-back-link"
				href="/"
				onClick={ ( event ) => {
					event.preventDefault();
					page(
						login( {
							redirectTo: this.props.redirectTo,
							locale: this.props.locale,
							oauth2ClientId: this.props.oauth2Client && this.props.oauth2Client.id,
							from: get( this.props.currentQuery, 'from' ),
							isJetpack: this.props.isJetpack,
						} )
					);
				} }
			>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ this.props.translate( 'Back to Login' ) }
			</a>
		);
	}

	renderSignUpLink( signupLinkText ) {
		// Taken from client/layout/masterbar/logged-out.jsx
		const {
			currentRoute,
			locale,
			oauth2Client,
			pathname,
			currentQuery,
			translate,
			usernameOrEmail,
		} = this.props;

		if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
			return null;
		}

		// use '?signup_url' if explicitly passed as URL query param
		const signupUrl = this.props.signupUrl
			? window.location.origin + pathWithLeadingSlash( this.props.signupUrl )
			: getSignupUrl( currentQuery, currentRoute, oauth2Client, locale, pathname );

		return (
			<Step.LinkButton
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
				{ signupLinkText ?? translate( 'Create a new account' ) }
			</Step.LinkButton>
		);
	}

	renderLoginHeaderNavigation() {
		return this.renderSignUpLink( this.props.translate( 'Create an account' ) );
	}

	renderContent( isSocialFirst ) {
		const {
			clientId,
			domain,
			isJetpack,
			isWhiteLogin,
			isGravPoweredClient,
			oauth2Client,
			socialConnect,
			twoFactorAuthType,
			socialService,
			socialServiceResponse,
			fromSite,
			locale,
			signupUrl,
			action,
			currentRoute,
			isLoginView,
		} = this.props;

		// It's used to toggle UIs for the login page of Gravatar powered clients only (excluding 2FA relevant pages).
		const isGravPoweredLoginPage =
			isGravPoweredClient &&
			! currentRoute.startsWith( '/log-in/push' ) &&
			! currentRoute.startsWith( '/log-in/authenticator' ) &&
			! currentRoute.startsWith( '/log-in/sms' ) &&
			! currentRoute.startsWith( '/log-in/webauthn' ) &&
			! currentRoute.startsWith( '/log-in/backup' );

		return (
			<LoginBlock
				action={ action }
				twoFactorAuthType={ twoFactorAuthType }
				socialConnect={ socialConnect }
				clientId={ clientId }
				isJetpack={ isJetpack }
				isWhiteLogin={ isWhiteLogin }
				isGravPoweredClient={ isGravPoweredClient }
				isGravPoweredLoginPage={ isGravPoweredLoginPage }
				oauth2Client={ oauth2Client }
				socialService={ socialService }
				socialServiceResponse={ socialServiceResponse }
				domain={ domain }
				fromSite={ fromSite }
				footer={
					isGravPoweredLoginPage ? (
						<GravPoweredLoginBlockFooter />
					) : (
						<LoginBlockFooter
							isLoginView={ isLoginView }
							lostPasswordLink={ this.getLostPasswordLink() }
							loginLink={ this.getLoginLink() }
						/>
					)
				}
				locale={ locale }
				handleUsernameChange={ this.handleUsernameChange.bind( this ) }
				signupUrl={ signupUrl }
				isSocialFirst={ isSocialFirst }
			/>
		);
	}

	render() {
		const {
			locale,
			translate,
			isGenericOauth,
			isGravPoweredClient,
			isBlazePro,
			isWhiteLogin,
			isJetpack,
			isFromAkismet,
			twoFactorAuthType,
			isManualRenewalImmediateLoginAttempt,
			socialConnect,
			linkingSocialService,
			action,
			oauth2Client,
			isWooJPC,
			isWCCOM,
			isWoo,
			isFromAutomatticForAgenciesPlugin,
			currentQuery,
			twoFactorEnabled,
		} = this.props;

		const canonicalUrl = localizeUrl( 'https://wordpress.com/log-in', locale );

		// TODO: remove isGravPoweredClient when login pages are unified.
		const isSocialFirst = isWhiteLogin && ! isGravPoweredClient;

		const mainContent = (
			<Main
				className={ clsx( 'wp-login__main', {
					'is-social-first': isSocialFirst,
					'is-generic-oauth': isGenericOauth,
					'is-jetpack': isJetpack,
				} ) }
			>
				{ ! isWhiteLogin && this.renderI18nSuggestions() }

				<DocumentHead
					title={ translate( 'Log In' ) }
					link={ [ { rel: 'canonical', href: canonicalUrl } ] }
					meta={ [
						{
							name: 'description',
							content: translate(
								'Log in to your WordPress.com account to manage your website, publish content, and access all your tools securely and easily.'
							),
						},
					] }
				/>

				<div className="wp-login__container">{ this.renderContent( isSocialFirst ) }</div>

				{ isWhiteLogin && this.renderI18nSuggestions() }
			</Main>
		);

		const headerText = getHeaderText(
			isSocialFirst,
			twoFactorAuthType,
			isManualRenewalImmediateLoginAttempt,
			socialConnect,
			linkingSocialService,
			action,
			oauth2Client,
			isWooJPC,
			isJetpack,
			isWCCOM,
			isFromAkismet,
			isFromAutomatticForAgenciesPlugin,
			isGravPoweredClient,
			twoFactorEnabled,
			currentQuery,
			translate
		);

		const shouldUseWideHeading =
			'lostpassword' !== action &&
			( isStudioAppOAuth2Client( oauth2Client ) ||
				isFromAkismet ||
				isCrowdsignalOAuth2Client( oauth2Client ) ||
				isBlazePro ||
				isJetpack ||
				isJetpackCloudOAuth2Client( oauth2Client ) ||
				isWoo ||
				isVIPOAuth2Client( oauth2Client ) ||
				isPartnerPortalOAuth2Client( oauth2Client ) );

		return (
			<>
				{ isWhiteLogin && (
					<Step.CenteredColumnLayout
						columnWidth={ 6 }
						{ ...( shouldUseWideHeading && { columnWidthHeading: 8 } ) }
						topBar={
							<Step.TopBar
								rightElement={ this.renderLoginHeaderNavigation() }
								compactLogo="always"
							/>
						}
						heading={
							<Step.Heading
								text={
									<>
										<HeadingLogo isFromAkismet={ isFromAkismet } isJetpack={ isJetpack } />
										<div className="wp-login__heading-text">{ headerText }</div>
									</>
								}
								subText={
									<HeadingSubText
										isSocialFirst={ isSocialFirst }
										twoFactorAuthType={ twoFactorAuthType }
										action={ action }
									/>
								}
							/>
						}
						verticalAlign="center"
					>
						{ mainContent }
					</Step.CenteredColumnLayout>
				) }
				{ ! isWhiteLogin && mainContent }
			</>
		);
	}
}

export default connect(
	( state, props ) => {
		const currentQuery = getCurrentQueryArguments( state );
		const oauth2Client = getCurrentOAuth2Client( state );
		const currentRoute = getCurrentRoute( state );

		return {
			locale: getCurrentLocaleSlug( state ),
			oauth2Client,
			isLoginView:
				! props.twoFactorAuthType &&
				! props.socialConnect &&
				// React lost password screen.
				! currentRoute.includes( '/lostpassword' ) &&
				// When user clicks on the signup link, it changes the route but it doesn't immediately render the signup page
				// So we need to check if the current route is not the signup route to avoid flickering
				! currentRoute.includes( '/start' ),
			emailQueryParam:
				currentQuery.email_address || getInitialQueryArguments( state ).email_address,
			isFromAkismet: isAkismetRedirect(
				new URLSearchParams( getRedirectToOriginal( state )?.split( '?' )[ 1 ] ).get( 'back' )
			),
			isWooJPC: isWooJPCFlow( state ),
			isWCCOM: getIsWCCOM( state ),
			isWoo: getIsWoo( state ),
			isBlazePro: getIsBlazePro( state ),
			// This applies to all oauth screens except for A4A, Blaze Pro, Jetpack, Woo.
			isGenericOauth:
				oauth2Client &&
				! isA4AOAuth2Client( oauth2Client ) &&
				! isBlazeProOAuth2Client( oauth2Client ) &&
				! isJetpackCloudOAuth2Client( oauth2Client ) &&
				! isWooOAuth2Client( oauth2Client ) &&
				! isCrowdsignalOAuth2Client( oauth2Client ) &&
				! isStudioAppOAuth2Client( oauth2Client ) &&
				! isVIPOAuth2Client( oauth2Client ),
			currentRoute,
			currentQuery,
			redirectTo: getRedirectToOriginal( state ),
			isFromAutomatticForAgenciesPlugin:
				'automattic-for-agencies-client' === get( getCurrentQueryArguments( state ), 'from' ) ||
				'automattic-for-agencies-client' ===
					new URLSearchParams( getRedirectToOriginal( state )?.split( '?' )[ 1 ] ).get( 'from' ),
			isManualRenewalImmediateLoginAttempt: wasManualRenewalImmediateLoginAttempted( state ),
		};
	},
	{
		recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
		recordTracksEvent,
	}
)( localize( Login ) );
