/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debugModule from 'debug';
import Gridicon from 'gridicons';
import page from 'page';
import { connect } from 'react-redux';
import { get, includes, startsWith } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AuthFormHeader from './auth-form-header';
import Button from 'components/button';
import Card from 'components/card';
import config from 'config';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Gravatar from 'components/gravatar';
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import JetpackConnectNotices from './jetpack-connect-notices';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import MainWrapper from './main-wrapper';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
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
	USER_IS_ALREADY_CONNECTED_TO_SITE,
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
} from 'state/jetpack-connect/selectors';

/**
 * Constants
 */
const debug = debugModule( 'calypso:jetpack-connect:authorize-form' );
const MAX_AUTH_ATTEMPTS = 3;
const PRESSABLE_PARTNER_ID = 49640;

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
		recordTracksEvent: PropTypes.func.isRequired,
		retryAuth: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		user: PropTypes.object.isRequired,
		userAlreadyConnected: PropTypes.bool.isRequired,
	};

	redirecting = false;
	retryingAuth = false;

	componentWillMount() {
		const { recordTracksEvent, isMobileAppFlow } = this.props;

		const { from, clientId } = this.props.authQuery;
		const tracksProperties = {
			from,
			is_mobile_app_flow: isMobileAppFlow,
			site: clientId,
		};

		recordTracksEvent( 'calypso_jpc_authorize_form_view', tracksProperties );
		recordTracksEvent( 'calypso_jpc_auth_view', tracksProperties );

		if ( this.shouldAutoAuthorize() ) {
			debug( 'Authorizing automatically on component mount' );
			return this.authorize();
		}
	}

	componentWillReceiveProps( nextProps ) {
		const { retryAuth } = nextProps;
		const { authorizeError, authorizeSuccess, siteReceived } = nextProps.authorizationData;
		const { alreadyAuthorized, redirectAfterAuth, site } = nextProps.authQuery;

		if (
			this.isSso( nextProps ) ||
			this.isWoo( nextProps ) ||
			this.isFromJpo( nextProps ) ||
			this.shouldRedirectJetpackStart( nextProps )
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
			site
		) {
			// Expired secret errors, and XMLRPC errors will be resolved in `handleResolve`.
			// Any other type of error, we will immediately and automatically retry the request as many times
			// as controlled by MAX_AUTH_ATTEMPTS.
			const attempts = this.props.authAttempts || 0;
			this.retryingAuth = true;
			return retryAuth( site, attempts + 1 );
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
			this.isWoo() ||
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
		if ( this.props.isMobileAppFlow ) {
			return false;
		}

		const { alreadyAuthorized, authApproved } = this.props.authQuery;

		return (
			this.isSso() ||
			this.isWoo() ||
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
	 * @param  {Object}  props          Props to test
	 * @param  {?string} props.authQuery.from     Where is the request from
	 * @param  {?number} props.authQuery.clientId Remote site ID
	 * @return {boolean}                True if it's a valid SSO request otherwise false
	 */
	isSso( props = this.props ) {
		const { from, clientId } = props.authQuery;
		return 'sso' === from && isSsoApproved( clientId );
	}

	isWoo( props = this.props ) {
		const { from } = props.authQuery;
		return includes( [ 'woocommerce-services-auto-authorize', 'woocommerce-setup-wizard' ], from );
	}

	shouldRedirectJetpackStart( props = this.props ) {
		const { partnerId } = props.authQuery;
		const partnerRedirectFlag = config.isEnabled(
			'jetpack/connect-redirect-pressable-credential-approval'
		);

		// If the redirect flag is set, then we conditionally redirect the Pressable client to
		// a credential approval screen. Otherwise, we need to redirect all other partners back
		// to wp-admin.
		return partnerRedirectFlag ? partnerId && PRESSABLE_PARTNER_ID !== partnerId : partnerId;
	}

	handleClickDisclaimer = () => {
		this.props.recordTracksEvent( 'calypso_jpc_disclaimer_link_click' );
	};

	handleClickHelp = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	};

	handleSignOut = () => {
		const { recordTracksEvent } = this.props;
		recordTracksEvent( 'calypso_jpc_signout_click' );
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
		const { alreadyAuthorized, redirectAfterAuth } = this.props.authQuery;

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
			<div>
				<div className="jetpack-connect__notices-container">
					<Notice
						icon="notice"
						status="is-error"
						text={ translate( 'We had trouble connecting.' ) }
						showDismiss={ false }
					>
						<NoticeAction onClick={ this.handleResolve }>{ translate( 'Try again' ) }</NoticeAction>
					</Notice>
				</div>
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
				{ this.renderErrorDetails() }
			</div>
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
			return this.renderXmlrpcFeedback();
		}
		return (
			<div>
				<JetpackConnectNotices
					noticeType={ DEFAULT_AUTHORIZE_ERROR }
					onTerminalError={ redirectToMobileApp }
				/>
				{ this.renderErrorDetails() }
			</div>
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

	getDisclaimerText() {
		const { blogname } = this.props.authQuery;

		const detailsLink = (
			<a
				target="_blank"
				rel="noopener noreferrer"
				onClick={ this.handleClickDisclaimer }
				href="https://jetpack.com/support/what-data-does-jetpack-sync/"
				className="jetpack-connect__sso-actions-modal-link"
			/>
		);

		const text = this.props.translate(
			'By connecting your site, you agree to {{detailsLink}}share details{{/detailsLink}} between WordPress.com and %(siteName)s.',
			{
				components: {
					detailsLink,
				},
				args: {
					siteName: decodeEntities( blogname ),
				},
			}
		);

		return <p className="jetpack-connect__tos-link">{ text }</p>;
	}

	getUserText() {
		const { translate } = this.props;
		const { authorizeSuccess } = this.props.authorizationData;
		let text = translate( 'Connecting as {{strong}}%(user)s{{/strong}}', {
			args: { user: this.props.user.display_name },
			components: { strong: <strong /> },
		} );

		if ( authorizeSuccess || this.props.isAlreadyOnSitesList ) {
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
		const { clientId, homeUrl, partnerId, redirectAfterAuth } = this.props.authQuery;

		// Redirect sites hosted on Pressable with a partner plan to some URL.
		if (
			config.isEnabled( 'jetpack/connect-redirect-pressable-credential-approval' ) &&
			PRESSABLE_PARTNER_ID === partnerId
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
				<Gridicon size={ 18 } icon="arrow-left" />{' '}
				{ translate( 'Return to %(sitename)s', {
					args: { sitename: decodeEntities( blogname ) },
				} ) }
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
					} ) }
				>
					{ translate( 'Sign in as a different user' ) }
				</LoggedOutFormLinkItem>
				<LoggedOutFormLinkItem onClick={ this.handleSignOut }>
					{ translate( 'Create a new account' ) }
				</LoggedOutFormLinkItem>
				<JetpackConnectHappychatButton eventName="calypso_jpc_authorize_chat_initiated">
					<HelpButton onClick={ this.handleClickHelp } />
				</JetpackConnectHappychatButton>
			</LoggedOutFormLinks>
		);
	}

	renderStateAction() {
		const { authorizeSuccess } = this.props.authorizationData;
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
		return (
			<LoggedOutFormFooter className="jetpack-connect__action-disclaimer">
				{ this.getDisclaimerText() }
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
			<MainWrapper>
				<div className="jetpack-connect__authorize-form">
					<div className="jetpack-connect__logged-in-form">
						<QueryUserConnection
							siteId={ this.props.authQuery.clientId }
							siteIsOnSitesList={ this.props.isAlreadyOnSitesList }
						/>
						<AuthFormHeader authQuery={ this.props.authQuery } />
						<Card>
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

export default connect(
	( state, { authQuery } ) => {
		// Note: reading from a cookie here rather than redux state,
		// so any change in value will not execute connect().
		const mobileAppRedirect = retrieveMobileRedirect();
		const isMobileAppFlow = !! mobileAppRedirect;

		return {
			authAttempts: getAuthAttempts( state, urlToSlug( authQuery.site ) ),
			authorizationData: getAuthorizationData( state ),
			calypsoStartedConnection: isCalypsoStartedConnection( authQuery.site ),
			hasExpiredSecretError: hasExpiredSecretErrorSelector( state ),
			hasXmlrpcError: hasXmlrpcErrorSelector( state ),
			isAlreadyOnSitesList: isRemoteSiteOnSitesList( state, authQuery.site ),
			isFetchingAuthorizationSite: isRequestingSite( state, authQuery.clientId ),
			isFetchingSites: isRequestingSites( state ),
			isMobileAppFlow,
			mobileAppRedirect,
			user: getCurrentUser( state ),
			userAlreadyConnected: getUserAlreadyConnected( state ),
		};
	},
	{
		authorize: authorizeAction,
		recordTracksEvent: recordTracksEventAction,
		retryAuth: retryAuthAction,
	}
)( localize( JetpackAuthorize ) );
