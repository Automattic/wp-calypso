/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import addQueryArgs from 'lib/route/add-query-args';
import debugModule from 'debug';
import Gridicon from 'gridicons';
import page from 'page';
import { connect } from 'react-redux';
import { get, startsWith } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AuthFormHeader from './auth-form-header';
import Button from 'components/button';
import Card from 'components/card';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Gravatar from 'components/gravatar';
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import JetpackConnectNotices from './jetpack-connect-notices';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import Spinner from 'components/spinner';
import userUtilities from 'lib/user/utils';
import { decodeEntities } from 'lib/formatting';
import { externalRedirect } from 'lib/route/path';
import { getCurrentUser } from 'state/current-user/selectors';
import { getJetpackConnectRedirectAfterAuth } from 'state/selectors';
import { isRequestingSite, isRequestingSites } from 'state/sites/selectors';
import { login } from 'lib/paths';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import { urlToSlug } from 'lib/url';
import {
	authorize as authorizeAction,
	goBackToWpAdmin as goBackToWpAdminAction,
	goToXmlrpcErrorFallbackUrl as goToXmlrpcErrorFallbackUrlAction,
	retryAuth as retryAuthAction,
} from 'state/jetpack-connect/actions';
import {
	getAuthAttempts,
	getAuthorizationData,
	getAuthorizationRemoteSite,
	getSiteIdFromQueryObject,
	getUserAlreadyConnected,
	hasExpiredSecretError as hasExpiredSecretErrorSelector,
	hasXmlrpcError as hasXmlrpcErrorSelector,
	isCalypsoStartedConnection,
	isRemoteSiteOnSitesList,
} from 'state/jetpack-connect/selectors';

/**
 * Constants
 */
const MAX_AUTH_ATTEMPTS = 3;
const PLANS_PAGE = '/jetpack/connect/plans/';
const debug = debugModule( 'calypso:jetpack-connect:authorize-form' );

class LoggedInForm extends Component {
	static propTypes = {
		isSSO: PropTypes.bool,
		isWoo: PropTypes.bool,

		// Connected props
		authAttempts: PropTypes.number.isRequired,
		authorizationData: PropTypes.shape( {
			authorizeError: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
			authorizeSuccess: PropTypes.bool,
			isRedirectingToWpAdmin: PropTypes.bool,
			queryObject: PropTypes.shape( {
				already_authorized: PropTypes.bool,
				jp_version: PropTypes.string.isRequired,
				new_user_started_connection: PropTypes.bool,
				site: PropTypes.string.isRequired,
			} ).isRequired,
			siteReceived: PropTypes.bool,
		} ).isRequired,
		authorize: PropTypes.func.isRequired,
		calypsoStartedConnection: PropTypes.bool,
		goBackToWpAdmin: PropTypes.func.isRequired,
		goToXmlrpcErrorFallbackUrl: PropTypes.func.isRequired,
		hasExpiredSecretError: PropTypes.bool,
		hasXmlrpcError: PropTypes.bool,
		isAlreadyOnSitesList: PropTypes.bool,
		isFetchingAuthorizationSite: PropTypes.bool,
		isFetchingSites: PropTypes.bool,
		recordTracksEvent: PropTypes.func.isRequired,
		redirectAfterAuth: PropTypes.string,
		retryAuth: PropTypes.func.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
		user: PropTypes.object.isRequired,
		userAlreadyConnected: PropTypes.bool.isRequired,
	};

	retryingAuth = false;
	state = { haveAuthorized: false };

	componentWillMount() {
		const { authorize, recordTracksEvent } = this.props;
		const { queryObject, autoAuthorize } = this.props.authorizationData;
		recordTracksEvent( 'calypso_jpc_auth_view' );

		const doAutoAuthorize =
			! this.props.isAlreadyOnSitesList &&
			! queryObject.already_authorized &&
			( this.props.calypsoStartedConnection ||
				queryObject.new_user_started_connection ||
				autoAuthorize );

		// isSSO is a separate case from the rest since we have already validated
		// it in authorize-form.jsx. Therefore, if it's set, just authorize and redirect.
		if ( this.props.isSSO || doAutoAuthorize ) {
			debug( 'Authorizing automatically on component mount' );
			this.setState( { haveAuthorized: true } );
			return authorize( queryObject );
		}
	}

	componentWillReceiveProps( nextProps ) {
		const { goBackToWpAdmin, redirectAfterAuth, retryAuth } = nextProps;
		const {
			siteReceived,
			queryObject,
			isRedirectingToWpAdmin,
			authorizeSuccess,
			authorizeError,
		} = nextProps.authorizationData;

		// For SSO, WooCommerce Services, and JPO users, do not display plans page
		// Instead, redirect back to admin as soon as we're connected
		if ( nextProps.isSSO || nextProps.isWoo || this.isFromJpo( nextProps ) ) {
			if ( ! isRedirectingToWpAdmin && authorizeSuccess ) {
				return goBackToWpAdmin( redirectAfterAuth );
			}
		} else if ( siteReceived ) {
			return this.redirect();
		} else if ( nextProps.isAlreadyOnSitesList && queryObject.already_authorized ) {
			return this.redirect();
		}
		if (
			authorizeError &&
			nextProps.authAttempts < MAX_AUTH_ATTEMPTS &&
			! this.retryingAuth &&
			! nextProps.hasXmlrpcError &&
			! nextProps.hasExpiredSecretError &&
			queryObject.site
		) {
			// Expired secret errors, and XMLRPC errors will be resolved in `handleResolve`.
			// Any other type of error, we will immediately and automatically retry the request as many times
			// as controlled by MAX_AUTH_ATTEMPTS.
			const attempts = this.props.authAttempts || 0;
			this.retryingAuth = true;
			return retryAuth( queryObject.site, attempts + 1 );
		}
	}

	redirect() {
		const { goBackToWpAdmin, redirectAfterAuth } = this.props;
		const { queryObject } = this.props.authorizationData;

		if ( this.props.isSSO || this.props.isWoo || this.isFromJpo( this.props ) ) {
			debug(
				'Going back to WP Admin.',
				'Connection initiated via: ',
				queryObject.from,
				'SSO found:',
				this.props.isSSO
			);
			goBackToWpAdmin( redirectAfterAuth );
		} else {
			page.redirect( this.getRedirectionTarget() );
		}
	}

	isFromJpo( props ) {
		return startsWith( get( props, [ 'authorizationData', 'queryObject', 'from' ] ), 'jpo' );
	}

	handleClickDisclaimer = () => {
		this.props.recordTracksEvent( 'calypso_jpc_disclaimer_link_click' );
	};

	handleClickHelp = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	};

	handleSignOut = () => {
		const { recordTracksEvent } = this.props;
		const { queryObject } = this.props.authorizationData;
		const redirect = addQueryArgs( queryObject, window.location.href );
		recordTracksEvent( 'calypso_jpc_signout_click' );
		userUtilities.logout( redirect );
	};

	handleResolve = () => {
		const { goToXmlrpcErrorFallbackUrl, recordTracksEvent } = this.props;
		const { queryObject, authorizationCode } = this.props.authorizationData;
		const authUrl = '/wp-admin/admin.php?page=jetpack&connect_url_redirect=true';
		this.retryingAuth = false;
		if ( this.props.hasExpiredSecretError ) {
			// In this case, we need to re-issue the secret.
			// We do this by redirecting to Jetpack client, which will automatically redirect back here.
			recordTracksEvent( 'calypso_jpc_resolve_expired_secret_error_click' );
			externalRedirect( queryObject.site + authUrl );
			return;
		}
		// Otherwise, we assume the site is having trouble receive XMLRPC requests.
		// To resolve, we redirect to the Jetpack Client, and attempt to complete the connection with
		// legacy functions on the client.
		recordTracksEvent( 'calypso_jpc_resolve_xmlrpc_error_click' );
		goToXmlrpcErrorFallbackUrl( queryObject, authorizationCode );
	};

	handleSubmit = () => {
		const { authorize, goBackToWpAdmin, recordTracksEvent, redirectAfterAuth } = this.props;
		const { queryObject, authorizeError, authorizeSuccess } = this.props.authorizationData;

		if (
			! this.props.isAlreadyOnSitesList &&
			! this.props.isFetchingSites &&
			queryObject.already_authorized
		) {
			recordTracksEvent( 'calypso_jpc_back_wpadmin_click' );
			return goBackToWpAdmin( redirectAfterAuth );
		}

		if ( this.props.isAlreadyOnSitesList && queryObject.already_authorized ) {
			recordTracksEvent( 'calypso_jpc_already_authorized_click' );
			return this.redirect();
		}

		if ( authorizeSuccess && ! queryObject.already_authorized ) {
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
		return authorize( queryObject );
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
			queryObject,
			isAuthorizing,
			authorizeSuccess,
			userAlreadyConnected,
		} = this.props.authorizationData;
		if (
			queryObject.already_authorized &&
			! this.props.isFetchingSites &&
			! this.props.isAlreadyOnSitesList
		) {
			// For users who start their journey at `wordpress.com/jetpack/connect` or similar flows, we will discourage
			// additional users from linking. Although it is possible to link multiple users with Jetpack, the `jetpack/connect`
			// flows will be reserved for brand new connections.
			return <JetpackConnectNotices noticeType="alreadyConnectedByOtherUser" />;
		}

		if ( userAlreadyConnected ) {
			// Via wp-admin it is possible to connect additional users after the initial connection is made. But if we
			// are trying to connect an additional user, and we are logged into a wordpress.com account that is already
			// connected, we need to show an error.
			return <JetpackConnectNotices noticeType="userIsAlreadyConnectedToSite" />;
		}

		if ( this.retryingAuth ) {
			return <JetpackConnectNotices noticeType="retryingAuth" />;
		}

		if (
			this.props.authAttempts < MAX_AUTH_ATTEMPTS &&
			this.props.authAttempts > 0 &&
			! isAuthorizing &&
			! authorizeSuccess
		) {
			return <JetpackConnectNotices noticeType="retryAuth" />;
		}

		if ( ! authorizeError ) {
			return null;
		}

		if ( authorizeError.message.indexOf( 'already_connected' ) >= 0 ) {
			return <JetpackConnectNotices noticeType="alreadyConnected" />;
		}
		if ( this.props.hasExpiredSecretError ) {
			return <JetpackConnectNotices noticeType="secretExpired" siteUrl={ queryObject.site } />;
		}
		if ( this.props.hasXmlrpcError ) {
			return this.renderXmlrpcFeedback();
		}
		return (
			<div>
				<JetpackConnectNotices noticeType="defaultAuthorizeError" />
				{ this.renderErrorDetails() }
			</div>
		);
	}

	getButtonText() {
		const { translate } = this.props;
		const {
			queryObject,
			isAuthorizing,
			authorizeSuccess,
			isRedirectingToWpAdmin,
			authorizeError,
		} = this.props.authorizationData;

		if (
			! this.props.isAlreadyOnSitesList &&
			! this.props.isFetchingSites &&
			queryObject.already_authorized
		) {
			return translate( 'Go back to your site' );
		}

		if ( authorizeError && ! this.retryingAuth ) {
			return translate( 'Try again' );
		}

		if ( this.props.isFetchingAuthorizationSite ) {
			return translate( 'Preparing authorization' );
		}

		if ( authorizeSuccess && isRedirectingToWpAdmin ) {
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
		const { queryObject } = this.props.authorizationData;
		const { blogname } = queryObject;

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
		return PLANS_PAGE + this.props.siteSlug;
	}

	renderFooterLinks() {
		const { redirectAfterAuth, translate } = this.props;
		const {
			queryObject,
			authorizeSuccess,
			isAuthorizing,
			isRedirectingToWpAdmin,
		} = this.props.authorizationData;
		const { blogname } = queryObject;
		const redirectTo = addQueryArgs( queryObject, window.location.href );
		const backToWpAdminLink = (
			<LoggedOutFormLinkItem icon={ true } href={ redirectAfterAuth }>
				<Gridicon size={ 18 } icon="arrow-left" />{' '}
				{ translate( 'Return to %(sitename)s', {
					args: { sitename: decodeEntities( blogname ) },
				} ) }
			</LoggedOutFormLinkItem>
		);

		if ( this.retryingAuth || isAuthorizing || isRedirectingToWpAdmin ) {
			return null;
		}

		if ( authorizeSuccess ) {
			return (
				<LoggedOutFormLinks>
					{ this.isWaitingForConfirmation() ? backToWpAdminLink : null }
					<LoggedOutFormLinkItem href={ this.getRedirectionTarget() }>
						{ translate( "I'm not interested in upgrades" ) }
					</LoggedOutFormLinkItem>
				</LoggedOutFormLinks>
			);
		}

		return (
			<LoggedOutFormLinks>
				{ this.isWaitingForConfirmation() ? backToWpAdminLink : null }
				<LoggedOutFormLinkItem href={ login( { redirectTo } ) }>
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
		const { authorizeSuccess, siteReceived } = this.props.authorizationData;
		if (
			this.props.isFetchingAuthorizationSite ||
			this.isAuthorizing() ||
			this.retryingAuth ||
			( authorizeSuccess && ! siteReceived )
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
			<div className="jetpack-connect__logged-in-form">
				<AuthFormHeader />
				<Card>
					<Gravatar user={ this.props.user } size={ 64 } />
					<p className="jetpack-connect__logged-in-form-user-text">{ this.getUserText() }</p>
					{ this.renderNotices() }
					{ this.renderStateAction() }
				</Card>
				{ this.renderFooterLinks() }
			</div>
		);
	}
}

export default connect(
	state => {
		const remoteSiteUrl = getAuthorizationRemoteSite( state );
		const siteId = getSiteIdFromQueryObject( state );
		const siteSlug = urlToSlug( remoteSiteUrl );

		return {
			authAttempts: getAuthAttempts( state, siteSlug ),
			authorizationData: getAuthorizationData( state ),
			calypsoStartedConnection: isCalypsoStartedConnection( state, remoteSiteUrl ),
			hasExpiredSecretError: hasExpiredSecretErrorSelector( state ),
			hasXmlrpcError: hasXmlrpcErrorSelector( state ),
			isAlreadyOnSitesList: isRemoteSiteOnSitesList( state ),
			isFetchingAuthorizationSite: isRequestingSite( state, siteId ),
			isFetchingSites: isRequestingSites( state ),
			redirectAfterAuth: getJetpackConnectRedirectAfterAuth( state ),
			siteSlug,
			user: getCurrentUser( state ),
			userAlreadyConnected: getUserAlreadyConnected( state ),
		};
	},
	{
		authorize: authorizeAction,
		goBackToWpAdmin: goBackToWpAdminAction,
		goToXmlrpcErrorFallbackUrl: goToXmlrpcErrorFallbackUrlAction,
		recordTracksEvent: recordTracksEventAction,
		retryAuth: retryAuthAction,
	}
)( localize( LoggedInForm ) );
