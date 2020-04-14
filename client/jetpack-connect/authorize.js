/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import debugModule from 'debug';
import page from 'page';
import { connect } from 'react-redux';
import { flowRight, get, includes, startsWith } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AuthFormHeader from './auth-form-header';
import { Button, Card } from '@automattic/components';
import canCurrentUser from 'state/selectors/can-current-user';
import config from 'config';
import Disclaimer from './disclaimer';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Gravatar from 'components/gravatar';
import Gridicon from 'components/gridicon';
import HelpButton from './help-button';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import isVipSite from 'state/selectors/is-vip-site';
import JetpackConnectHappychatButton from './happychat-button';
import JetpackConnectNotices from './jetpack-connect-notices';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import MainWrapper from './main-wrapper';
import QueryUserConnection from 'components/data/query-user-connection';
import Spinner from 'components/spinner';
import userUtilities from 'lib/user/utils';
import { addQueryArgs, externalRedirect } from 'lib/route';
import { authQueryPropTypes, getRoleFromScope } from './utils';
import { decodeEntities } from 'lib/formatting';
import { getCurrentUser } from 'state/current-user/selectors';
import { isRequestingSite, isRequestingSites } from 'state/sites/selectors';
import { JPC_PATH_PLANS, REMOTE_PATH_AUTH } from './constants';
import { login } from 'lib/paths';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import { urlToSlug } from 'lib/url';
import {
	ALREADY_CONNECTED,
	ALREADY_CONNECTED_BY_OTHER_USER,
	DEFAULT_AUTHORIZE_ERROR,
	RETRY_AUTH,
	RETRYING_AUTH,
	SECRET_EXPIRED,
	SITE_BLACKLISTED,
	USER_IS_ALREADY_CONNECTED_TO_SITE,
	XMLRPC_ERROR,
} from './connection-notice-types';
import {
	isCalypsoStartedConnection,
	isSsoApproved,
	retrieveMobileRedirect,
} from './persistence-utils';
import {
	authorize as authorizeAction,
	retryAuth as retryAuthAction,
} from 'state/jetpack-connect/actions';
import {
	getAuthAttempts,
	getAuthorizationData,
	getUserAlreadyConnected,
	hasExpiredSecretError as hasExpiredSecretErrorSelector,
	hasXmlrpcError as hasXmlrpcErrorSelector,
	isRemoteSiteOnSitesList,
	isSiteBlacklistedError as isSiteBlacklistedSelector,
} from 'state/jetpack-connect/selectors';
import getPartnerIdFromQuery from 'state/selectors/get-partner-id-from-query';
import getPartnerSlugFromQuery from 'state/selectors/get-partner-slug-from-query';

/**
 * Constants
 */
const debug = debugModule( 'calypso:jetpack-connect:authorize-form' );
const MAX_AUTH_ATTEMPTS = 3;

export class JetpackAuthorize extends Component {
	static propTypes = {
		authQuery: authQueryPropTypes.isRequired,

		// Connected props
		authAttempts: PropTypes.number.isRequired,
		authorizationData: PropTypes.shape( {
			authorizationCode: PropTypes.string,
			authorizeError: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
			authorizeSuccess: PropTypes.bool,
			siteReceived: PropTypes.bool,
		} ).isRequired,
		authorize: PropTypes.func.isRequired,
		calypsoStartedConnection: PropTypes.bool,
		hasExpiredSecretError: PropTypes.bool,
		hasXmlrpcError: PropTypes.bool,
		isAlreadyOnSitesList: PropTypes.bool,
		isFetchingAuthorizationSite: PropTypes.bool,
		isFetchingSites: PropTypes.bool,
		isSiteBlacklisted: PropTypes.bool,
		recordTracksEvent: PropTypes.func.isRequired,
		retryAuth: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		user: PropTypes.object.isRequired,
		userAlreadyConnected: PropTypes.bool.isRequired,
	};

	redirecting = false;
	retryingAuth = false;

	UNSAFE_componentWillMount() {
		const { recordTracksEvent, isMobileAppFlow } = this.props;

		const { from, clientId, closeWindowAfterLogin } = this.props.authQuery;
		const tracksProperties = {
			from,
			is_mobile_app_flow: isMobileAppFlow,
			site: clientId,
		};

		if ( closeWindowAfterLogin && typeof window !== 'undefined' ) {
			// Certain connection flows may complete the login step within a popup window.
			// In these cases, we'll want to automatically close the window when the login
			// step is complete, and continue authorization in the parent window.
			debug( 'Closing window after login' );
			window.close();
		}

		recordTracksEvent( 'calypso_jpc_authorize_form_view', tracksProperties );
		recordTracksEvent( 'calypso_jpc_auth_view', tracksProperties );

		if ( this.shouldAutoAuthorize() ) {
			debug( 'Authorizing automatically on component mount' );
			return this.authorize();
		}
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { retryAuth } = nextProps;
		const { authorizeError, authorizeSuccess, siteReceived } = nextProps.authorizationData;
		const { alreadyAuthorized, redirectAfterAuth, site } = nextProps.authQuery;

		if (
			this.isSso( nextProps ) ||
			this.isWooRedirect( nextProps ) ||
			this.isFromJpo( nextProps ) ||
			this.shouldRedirectJetpackStart( nextProps ) ||
			this.props.isVip
		) {
			if ( authorizeSuccess ) {
				return this.externalRedirectOnce( redirectAfterAuth );
			}
		} else if ( siteReceived ) {
			return this.redirect();
		} else if ( nextProps.isAlreadyOnSitesList && alreadyAuthorized ) {
			return this.redirect();
		}
		if (
			authorizeError &&
			nextProps.authAttempts < MAX_AUTH_ATTEMPTS &&
			! this.retryingAuth &&
			! nextProps.hasXmlrpcError &&
			! nextProps.hasExpiredSecretError &&
			! nextProps.isSiteBlacklisted &&
			site
		) {
			// Expired secret errors, and XMLRPC errors will be resolved in `handleResolve`.
			// Any other type of error, we will immediately and automatically retry the request as many times
			// as controlled by MAX_AUTH_ATTEMPTS.
			const attempts = this.props.authAttempts || 0;
			this.retryingAuth = true;
			return retryAuth( site, attempts + 1, nextProps.authQuery.from, redirectAfterAuth );
		}
	}

	authorize() {
		this.props.authorize( {
			_wp_nonce: this.props.authQuery.nonce,
			client_id: this.props.authQuery.clientId,
			from: this.props.authQuery.from,
			jp_version: this.props.authQuery.jpVersion,
			redirect_uri: this.props.authQuery.redirectUri,
			scope: this.props.authQuery.scope,
			secret: this.props.authQuery.secret,
			state: this.props.authQuery.state,
		} );
	}

	externalRedirectOnce( url ) {
		if ( ! this.redirecting ) {
			this.redirecting = true;
			debug( `Redirecting to ${ url }` );
			externalRedirect( url );
		}
	}

	redirect() {
		const { isMobileAppFlow, mobileAppRedirect } = this.props;
		const { from, redirectAfterAuth, scope } = this.props.authQuery;

		if ( isMobileAppFlow ) {
			debug( `Redirecting to mobile app ${ mobileAppRedirect }` );
			window.location.replace( mobileAppRedirect );
			return;
		}

		if (
			this.isSso() ||
			this.isWooRedirect() ||
			this.isFromJpo() ||
			this.shouldRedirectJetpackStart() ||
			getRoleFromScope( scope ) === 'subscriber'
		) {
			debug(
				'Going back to WP Admin.',
				'Connection initiated via: ',
				from,
				'SSO found:',
				this.isSso()
			);
			this.externalRedirectOnce( redirectAfterAuth );
		} else {
			page.redirect( this.getRedirectionTarget() );
		}
	}

	redirectToXmlRpcErrorFallbackUrl() {
		const { state, redirectUri } = this.props.authQuery;
		const code = this.props.authorizationData.authorizationCode;
		const url = addQueryArgs( { code, state }, redirectUri );
		debug( 'xmlrpc fallback to', url );
		this.externalRedirectOnce( url );
	}

	shouldAutoAuthorize() {
		const { alreadyAuthorized, authApproved, from } = this.props.authQuery;
		return (
			this.isSso() ||
			includes( [ 'woocommerce-services-auto-authorize', 'woocommerce-setup-wizard' ], from ) || // Auto authorize the old WooCommerce setup wizard only.
			( ! this.props.isAlreadyOnSitesList &&
				! alreadyAuthorized &&
				( this.props.calypsoStartedConnection || authApproved ) )
		);
	}

	isFromJpo( props = this.props ) {
		const { from } = props.authQuery;
		return startsWith( from, 'jpo' );
	}

	/**
	 * Check whether this a valid authorized SSO request
	 *
	 * @param  {object}  props          Props to test
	 * @param  {?string} props.authQuery.from     Where is the request from
	 * @param  {?number} props.authQuery.clientId Remote site ID
	 * @returns {boolean}                True if it's a valid SSO request otherwise false
	 */
	isSso( props = this.props ) {
		const { from, clientId } = props.authQuery;
		return 'sso' === from && isSsoApproved( clientId );
	}

	isWooRedirect( props = this.props ) {
		const { from } = props.authQuery;
		return includes(
			[
				'woocommerce-services-auto-authorize',
				'woocommerce-setup-wizard',
				'woocommerce-onboarding',
			],
			from
		);
	}

	isWooOnboarding( props = this.props ) {
		const { from } = props.authQuery;
		return 'woocommerce-onboarding' === from;
	}

	shouldRedirectJetpackStart( props = this.props ) {
		const { partnerSlug, partnerID } = props;
		const pressableRedirectFlag = config.isEnabled(
			'jetpack/connect-redirect-pressable-credential-approval'
		);

		// If the redirect flag is set, then we conditionally redirect the Pressable client to
		// a credential approval screen. Otherwise, we need to redirect all other partners back
		// to wp-admin.
		if ( pressableRedirectFlag ) {
			return partnerID && 'pressable' !== partnerSlug;
		}

		// If partner ID query param is set, then assume that the connection is from the Jetpack Start flow.
		return !! partnerID;
	}

	handleSignIn = () => {
		const { recordTracksEvent } = this.props;
		const { from } = this.props.authQuery;
		if ( config.isEnabled( 'jetpack/connect/woocommerce' ) && 'woocommerce-onboarding' === from ) {
			recordTracksEvent( 'wcadmin_storeprofiler_connect_store', { different_account: true } );
		}
	};

	handleSignOut = () => {
		const { recordTracksEvent } = this.props;
		const { from } = this.props.authQuery;
		recordTracksEvent( 'calypso_jpc_signout_click' );

		if ( config.isEnabled( 'jetpack/connect/woocommerce' ) && 'woocommerce-onboarding' === from ) {
			recordTracksEvent( 'wcadmin_storeprofiler_connect_store', { create_jetpack: true } );
		}

		userUtilities.logout( window.location.href );
	};

	handleResolve = () => {
		const { site, recordTracksEvent } = this.props;
		this.retryingAuth = false;
		if ( this.props.hasExpiredSecretError ) {
			// In this case, we need to re-issue the secret.
			// We do this by redirecting to Jetpack client, which will automatically redirect back here.
			recordTracksEvent( 'calypso_jpc_resolve_expired_secret_error_click' );
			this.externalRedirectOnce( site + REMOTE_PATH_AUTH );
			return;
		}
		// Otherwise, we assume the site is having trouble receive XMLRPC requests.
		// To resolve, we redirect to the Jetpack Client, and attempt to complete the connection with
		// legacy functions on the client.
		recordTracksEvent( 'calypso_jpc_resolve_xmlrpc_error_click' );
		this.redirectToXmlRpcErrorFallbackUrl();
	};

	handleSubmit = () => {
		const { recordTracksEvent } = this.props;
		const { authorizeError, authorizeSuccess } = this.props.authorizationData;
		const { alreadyAuthorized, redirectAfterAuth, from } = this.props.authQuery;

		if ( ! this.props.isAlreadyOnSitesList && ! this.props.isFetchingSites && alreadyAuthorized ) {
			recordTracksEvent( 'calypso_jpc_back_wpadmin_click' );
			return this.externalRedirectOnce( redirectAfterAuth );
		}

		if ( this.props.isAlreadyOnSitesList && alreadyAuthorized ) {
			recordTracksEvent( 'calypso_jpc_already_authorized_click' );
			return this.redirect();
		}

		if ( authorizeSuccess && ! alreadyAuthorized ) {
			recordTracksEvent( 'calypso_jpc_activate_click' );
			return this.redirect();
		}
		if ( authorizeError ) {
			recordTracksEvent( 'calypso_jpc_try_again_click' );
			return this.handleResolve();
		}
		if ( this.props.isAlreadyOnSitesList ) {
			recordTracksEvent( 'calypso_jpc_return_site_click' );
			return this.redirect();
		}

		recordTracksEvent( 'calypso_jpc_approve_click' );

		if ( config.isEnabled( 'jetpack/connect/woocommerce' ) && 'woocommerce-onboarding' === from ) {
			recordTracksEvent( 'wcadmin_storeprofiler_connect_store', { use_account: true } );
		}

		return this.authorize();
	};

	isAuthorizing() {
		const { isAuthorizing } = this.props.authorizationData;
		return ! this.props.isAlreadyOnSitesList && isAuthorizing;
	}

	renderErrorDetails() {
		const { authorizeError } = this.props.authorizationData;
		return (
			<div className="jetpack-connect__error-details">
				<FormLabel>{ this.props.translate( 'Error Details' ) }</FormLabel>
				<FormSettingExplanation>{ authorizeError.message }</FormSettingExplanation>
			</div>
		);
	}

	renderXmlrpcFeedback() {
		const { translate } = this.props;

		return (
			<p>
				{ translate(
					'WordPress.com was unable to reach your site and approve the connection. ' +
						'Try again by clicking the button above; ' +
						"if that doesn't work you may need to {{link}}contact support{{/link}}.",
					{
						components: {
							link: (
								<a
									href="https://jetpack.com/contact-support"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			</p>
		);
	}

	renderNotices() {
		const {
			authorizeError,
			isAuthorizing,
			authorizeSuccess,
			userAlreadyConnected,
		} = this.props.authorizationData;
		const { alreadyAuthorized, site } = this.props.authQuery;

		let redirectToMobileApp = null;
		if ( this.props.isMobileAppFlow ) {
			redirectToMobileApp = reason => {
				const url = addQueryArgs( { reason }, this.props.mobileAppRedirect );
				this.externalRedirectOnce( url );
			};
		}

		if ( alreadyAuthorized && ! this.props.isFetchingSites && ! this.props.isAlreadyOnSitesList ) {
			// For users who start their journey at `wordpress.com/jetpack/connect` or similar flows, we will discourage
			// additional users from linking. Although it is possible to link multiple users with Jetpack, the `jetpack/connect`
			// flows will be reserved for brand new connections.
			return (
				<JetpackConnectNotices
					noticeType={ ALREADY_CONNECTED_BY_OTHER_USER }
					onTerminalError={ redirectToMobileApp }
				/>
			);
		}

		if ( userAlreadyConnected ) {
			// Via wp-admin it is possible to connect additional users after the initial connection is made. But if we
			// are trying to connect an additional user, and we are logged into a wordpress.com account that is already
			// connected, we need to show an error.
			return (
				<JetpackConnectNotices
					noticeType={ USER_IS_ALREADY_CONNECTED_TO_SITE }
					onTerminalError={ redirectToMobileApp }
				/>
			);
		}

		if ( this.retryingAuth ) {
			return (
				<JetpackConnectNotices
					noticeType={ RETRYING_AUTH }
					onTerminalError={ redirectToMobileApp }
				/>
			);
		}

		if (
			this.props.authAttempts < MAX_AUTH_ATTEMPTS &&
			this.props.authAttempts > 0 &&
			! isAuthorizing &&
			! authorizeSuccess
		) {
			return (
				<JetpackConnectNotices noticeType={ RETRY_AUTH } onTerminalError={ redirectToMobileApp } />
			);
		}

		if ( ! authorizeError ) {
			return null;
		}

		if ( includes( get( authorizeError, 'message' ), 'already_connected' ) ) {
			return (
				<JetpackConnectNotices
					noticeType={ ALREADY_CONNECTED }
					onTerminalError={ redirectToMobileApp }
				/>
			);
		}
		if ( this.props.hasExpiredSecretError ) {
			return (
				<JetpackConnectNotices
					noticeType={ SECRET_EXPIRED }
					siteUrl={ site }
					onTerminalError={ redirectToMobileApp }
				/>
			);
		}
		if ( this.props.hasXmlrpcError ) {
			return (
				<Fragment>
					<JetpackConnectNotices
						noticeType={ XMLRPC_ERROR }
						onActionClick={ this.handleResolve }
						onTerminalError={ redirectToMobileApp }
					/>
					{ this.renderXmlrpcFeedback() }
					{ this.renderErrorDetails() }
				</Fragment>
			);
		}
		if ( this.props.isSiteBlacklisted ) {
			return (
				<JetpackConnectNotices
					noticeType={ SITE_BLACKLISTED }
					onTerminalError={ redirectToMobileApp }
				/>
			);
		}
		return (
			<Fragment>
				<JetpackConnectNotices
					noticeType={ DEFAULT_AUTHORIZE_ERROR }
					onTerminalError={ redirectToMobileApp }
				/>
				{ this.renderErrorDetails() }
			</Fragment>
		);
	}

	getButtonText() {
		const { translate } = this.props;
		const { authorizeError, authorizeSuccess, isAuthorizing } = this.props.authorizationData;
		const { alreadyAuthorized } = this.props.authQuery;

		if ( ! this.props.isAlreadyOnSitesList && ! this.props.isFetchingSites && alreadyAuthorized ) {
			return translate( 'Go back to your site' );
		}

		if ( authorizeError && ! this.retryingAuth ) {
			return translate( 'Try again' );
		}

		if ( this.props.isFetchingAuthorizationSite ) {
			return translate( 'Preparing authorization' );
		}

		if ( authorizeSuccess && this.redirecting ) {
			return translate( 'Returning to your site' );
		}

		if ( authorizeSuccess ) {
			return translate( 'Finishing up!', {
				context:
					'Shown during a jetpack authorization process, while we retrieve the info we need to show the last page',
			} );
		}

		if ( isAuthorizing || this.retryingAuth ) {
			return translate( 'Authorizing your connection' );
		}

		if ( this.props.isAlreadyOnSitesList ) {
			return translate( 'Return to your site' );
		}

		if ( ! this.retryingAuth ) {
			return translate( 'Approve' );
		}
	}

	getUserText() {
		const { translate } = this.props;
		const { authorizeSuccess } = this.props.authorizationData;
		// translators: %(user) is user's Display Name (Eg Connecting as John Doe)
		let text = translate( 'Connecting as {{strong}}%(user)s{{/strong}}', {
			args: { user: this.props.user.display_name },
			components: { strong: <strong /> },
		} );

		if ( authorizeSuccess || this.props.isAlreadyOnSitesList ) {
			// translators: %(user) is user's Display Name (Eg Connected as John Doe)
			text = translate( 'Connected as {{strong}}%(user)s{{/strong}}', {
				args: { user: this.props.user.display_name },
				components: { strong: <strong /> },
			} );
		}

		return text;
	}

	isWaitingForConfirmation() {
		const { isAuthorizing, authorizeSuccess, siteReceived } = this.props.authorizationData;
		return ! ( isAuthorizing || authorizeSuccess || siteReceived );
	}

	getRedirectionTarget() {
		const { clientId, homeUrl, redirectAfterAuth } = this.props.authQuery;
		const { partnerSlug } = this.props;

		// Redirect sites hosted on Pressable with a partner plan to some URL.
		if (
			config.isEnabled( 'jetpack/connect-redirect-pressable-credential-approval' ) &&
			'pressable' === partnerSlug
		) {
			return `/start/pressable-nux?blogid=${ clientId }`;
		}

		return addQueryArgs(
			{ redirect: redirectAfterAuth },
			`${ JPC_PATH_PLANS }/${ urlToSlug( homeUrl ) }`
		);
	}

	renderFooterLinks() {
		const { translate } = this.props;
		const { authorizeSuccess, isAuthorizing } = this.props.authorizationData;
		const { blogname, redirectAfterAuth } = this.props.authQuery;
		const backToWpAdminLink = (
			<LoggedOutFormLinkItem href={ redirectAfterAuth }>
				<Gridicon size={ 18 } icon="arrow-left" />{ ' ' }
				{
					// translators: eg: Return to The WordPress.com Blog
					translate( 'Return to %(sitename)s', {
						args: { sitename: decodeEntities( blogname ) },
					} )
				}
			</LoggedOutFormLinkItem>
		);

		if ( this.retryingAuth || isAuthorizing || authorizeSuccess || this.redirecting ) {
			return null;
		}

		return (
			<LoggedOutFormLinks>
				{ this.isWaitingForConfirmation() ? backToWpAdminLink : null }
				<LoggedOutFormLinkItem
					href={ login( {
						isJetpack: true,
						isNative: config.isEnabled( 'login/native-login-links' ),
						redirectTo: window.location.href,
						isWoo: this.isWooOnboarding(),
					} ) }
					onClick={ this.handleSignIn }
				>
					{ translate( 'Sign in as a different user' ) }
				</LoggedOutFormLinkItem>
				<LoggedOutFormLinkItem onClick={ this.handleSignOut }>
					{ translate( 'Create a new account' ) }
				</LoggedOutFormLinkItem>
				<JetpackConnectHappychatButton eventName="calypso_jpc_authorize_chat_initiated">
					<HelpButton />
				</JetpackConnectHappychatButton>
			</LoggedOutFormLinks>
		);
	}

	renderStateAction() {
		const { authorizeSuccess } = this.props.authorizationData;

		if ( this.props.isSiteBlacklisted ) {
			return null;
		}

		if (
			this.props.isFetchingAuthorizationSite ||
			this.isAuthorizing() ||
			this.retryingAuth ||
			authorizeSuccess
		) {
			return (
				<div className="jetpack-connect__logged-in-form-loading">
					<span>{ this.getButtonText() }</span> <Spinner size={ 20 } duration={ 3000 } />
				</div>
			);
		}

		const { blogname } = this.props.authQuery;

		return (
			<LoggedOutFormFooter className="jetpack-connect__action-disclaimer">
				<Disclaimer siteName={ decodeEntities( blogname ) } />
				<Button
					primary
					disabled={ this.isAuthorizing() || this.props.hasXmlrpcError }
					onClick={ this.handleSubmit }
				>
					{ this.getButtonText() }
				</Button>
			</LoggedOutFormFooter>
		);
	}

	render() {
		return (
			<MainWrapper isWoo={ this.isWooOnboarding() }>
				<div className="jetpack-connect__authorize-form">
					<div className="jetpack-connect__logged-in-form">
						<QueryUserConnection
							siteId={ this.props.authQuery.clientId }
							siteIsOnSitesList={ this.props.isAlreadyOnSitesList }
						/>
						<AuthFormHeader authQuery={ this.props.authQuery } isWoo={ this.isWooOnboarding() } />
						<Card className="jetpack-connect__logged-in-card">
							<Gravatar user={ this.props.user } size={ 64 } />
							<p className="jetpack-connect__logged-in-form-user-text">{ this.getUserText() }</p>
							{ this.renderNotices() }
							{ this.renderStateAction() }
						</Card>
						{ this.renderFooterLinks() }
					</div>
				</div>
			</MainWrapper>
		);
	}
}

const connectComponent = connect(
	( state, { authQuery } ) => {
		// Note: reading from a cookie here rather than redux state,
		// so any change in value will not execute connect().
		const mobileAppRedirect = retrieveMobileRedirect();
		const isMobileAppFlow = !! mobileAppRedirect;

		return {
			authAttempts: getAuthAttempts( state, urlToSlug( authQuery.site ) ),
			authorizationData: getAuthorizationData( state ),
			calypsoStartedConnection: isCalypsoStartedConnection( authQuery.site ),
			canManageOptions: canCurrentUser( state, authQuery.clientId, 'manage_options' ),
			hasExpiredSecretError: hasExpiredSecretErrorSelector( state ),
			hasXmlrpcError: hasXmlrpcErrorSelector( state ),
			isAlreadyOnSitesList: isRemoteSiteOnSitesList( state, authQuery.site ),
			isAtomic: isSiteAutomatedTransfer( state, authQuery.clientId ),
			isFetchingAuthorizationSite: isRequestingSite( state, authQuery.clientId ),
			isFetchingSites: isRequestingSites( state ),
			isMobileAppFlow,
			isSiteBlacklisted: isSiteBlacklistedSelector( state ),
			isVip: isVipSite( state, authQuery.clientId ),
			mobileAppRedirect,
			partnerID: getPartnerIdFromQuery( state ),
			partnerSlug: getPartnerSlugFromQuery( state ),
			user: getCurrentUser( state ),
			userAlreadyConnected: getUserAlreadyConnected( state ),
		};
	},
	{
		authorize: authorizeAction,
		recordTracksEvent: recordTracksEventAction,
		retryAuth: retryAuthAction,
	}
);

export default flowRight( connectComponent, localize )( JetpackAuthorize );
