/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import Gridicon from 'gridicons';
import addQueryArgs from 'lib/route/add-query-args';
import debugModule from 'debug';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Gravatar from 'components/gravatar';
import HelpButton from './help-button';
import JetpackConnectNotices from './jetpack-connect-notices';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import SiteCard from './site-card';
import Spinner from 'components/spinner';
import FormattedHeader from 'components/formatted-header';
import userUtilities from 'lib/user/utils';
import versionCompare from 'lib/version-compare';
import { decodeEntities } from 'lib/formatting';
import { externalRedirect } from 'lib/route/path';
import { login } from 'lib/paths';

/**
 * Constants
 */
const MAX_AUTH_ATTEMPTS = 3;
const PLANS_PAGE = '/jetpack/connect/plans/';
const debug = debugModule( 'calypso:jetpack-connect:authorize-form' );

class LoggedInForm extends Component {
	static propTypes = {
		authAttempts: PropTypes.number.isRequired,
		authorize: PropTypes.func.isRequired,
		calypsoStartedConnection: PropTypes.bool,
		goBackToWpAdmin: PropTypes.func.isRequired,
		isAlreadyOnSitesList: PropTypes.bool,
		isFetchingSites: PropTypes.bool,
		isFetchingAuthorizationSite: PropTypes.bool,
		isSSO: PropTypes.bool,
		isWCS: PropTypes.bool,
		jetpackConnectAuthorize: PropTypes.shape( {
			authorizeError: PropTypes.oneOfType( [
				PropTypes.object,
				PropTypes.bool,
			] ),
			authorizeSuccess: PropTypes.bool,
			isRedirectingToWpAdmin: PropTypes.bool,
			queryObject: PropTypes.shape( {
				already_authorized: PropTypes.bool,
				jp_version: PropTypes.string.isRequired,
				new_user_started_connection: PropTypes.bool,
				redirect_after_auth: PropTypes.string.isRequired,
				site: PropTypes.string.isRequired,
			} ).isRequired,
			siteReceived: PropTypes.bool,
		} ).isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		requestHasExpiredSecretError: PropTypes.func.isRequired,
		requestHasXmlrpcError: PropTypes.func.isRequired,
		retryAuth: PropTypes.func.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
		user: PropTypes.object.isRequired,
	};

	state = { haveAuthorized: false };

	componentWillMount() {
		const { queryObject, autoAuthorize } = this.props.jetpackConnectAuthorize;
		this.props.recordTracksEvent( 'calypso_jpc_auth_view' );
		if ( ! this.props.isAlreadyOnSitesList &&
			! queryObject.already_authorized &&
			(
				this.props.calypsoStartedConnection ||
				this.props.isSSO ||
				queryObject.new_user_started_connection ||
				autoAuthorize
			)
		) {
			debug( 'Authorizing automatically on component mount' );
			this.setState( { haveAuthorized: true } );
			return this.props.authorize( queryObject );
		}
	}

	componentWillReceiveProps( props ) {
		const {
			siteReceived,
			queryObject,
			isRedirectingToWpAdmin,
			authorizeSuccess,
			authorizeError
		} = props.jetpackConnectAuthorize;

		// For SSO, WooCommerce Services, and JPO users, do not display plans page
		// Instead, redirect back to admin as soon as we're connected
		if ( props.isSSO || props.isWCS || ( queryObject && 'jpo' === queryObject.from ) ) {
			if ( ! isRedirectingToWpAdmin && authorizeSuccess ) {
				return this.props.goBackToWpAdmin( queryObject.redirect_after_auth );
			}
		} else if ( siteReceived ) {
			return this.redirect();
		} else if ( props.isAlreadyOnSitesList && queryObject.already_authorized ) {
			return this.redirect();
		}
		if (
			authorizeError &&
			props.authAttempts < MAX_AUTH_ATTEMPTS &&
			! this.retryingAuth &&
			! props.requestHasXmlrpcError() &&
			! props.requestHasExpiredSecretError() &&
			queryObject.site
		) {
			// Expired secret errors, and XMLRPC errors will be resolved in `handleResolve`.
			// Any other type of error, we will immediately and automatically retry the request as many times
			// as controlled by MAX_AUTH_ATTEMPTS.
			const attempts = this.props.authAttempts || 0;
			this.retryingAuth = true;
			return this.props.retryAuth( queryObject.site, attempts + 1 );
		}
	}

	renderFormHeader( isConnected ) {
		const { translate, isAlreadyOnSitesList } = this.props;
		const { queryObject } = this.props.jetpackConnectAuthorize;
		const headerText = ( isConnected )
			? translate( 'You are connected!' )
			: translate( 'Completing connection' );
		const subHeaderText = ( isConnected )
			? translate( 'Thank you for flying with Jetpack' )
			: translate( 'Jetpack is finishing up the connection process' );
		const siteCard = versionCompare( queryObject.jp_version, '4.0.3', '>' )
			? <SiteCard queryObject={ queryObject } isAlreadyOnSitesList={ isAlreadyOnSitesList } />
			: null;

		return (
			<div>
				<FormattedHeader
					headerText={ headerText }
					subHeaderText={ subHeaderText } />
				{ siteCard }
			</div>
		);
	}

	redirect() {
		const { queryObject } = this.props.jetpackConnectAuthorize;

		if ( 'jpo' === queryObject.from || this.props.isSSO || this.props.isWCS ) {
			debug( 'Going back to WP Admin.', 'Connection initiated via: ', queryObject.from, 'SSO found:', this.props.isSSO );
			this.props.goBackToWpAdmin( queryObject.redirect_after_auth );
		} else {
			page.redirect( this.getRedirectionTarget() );
		}
	}

	handleClickDisclaimer = () => {
		this.props.recordTracksEvent( 'calypso_jpc_disclaimer_link_click' );
	};

	handleClickHelp = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	};

	handleSignOut = () => {
		const { queryObject } = this.props.jetpackConnectAuthorize;
		const redirect = addQueryArgs( queryObject, window.location.href );
		this.props.recordTracksEvent( 'calypso_jpc_signout_click' );
		userUtilities.logout( redirect );
	};

	handleResolve = () => {
		const { queryObject, authorizationCode } = this.props.jetpackConnectAuthorize;
		const authUrl = '/wp-admin/admin.php?page=jetpack&connect_url_redirect=true';
		this.retryingAuth = false;
		if ( this.props.requestHasExpiredSecretError() ) {
			// In this case, we need to re-issue the secret.
			// We do this by redirecting to Jetpack client, which will automatically redirect back here.
			this.props.recordTracksEvent( 'calypso_jpc_resolve_expired_secret_error_click' );
			externalRedirect( queryObject.site + authUrl );
			return;
		}
		// Otherwise, we assume the site is having trouble receive XMLRPC requests.
		// To resolve, we redirect to the Jetpack Client, and attempt to complete the connection with
		// legacy functions on the client.
		this.props.recordTracksEvent( 'calypso_jpc_resolve_xmlrpc_error_click' );
		this.props.goToXmlrpcErrorFallbackUrl( queryObject, authorizationCode );
	};

	handleSubmit = () => {
		const {
			queryObject,
			authorizeError,
			authorizeSuccess
		} = this.props.jetpackConnectAuthorize;

		if ( ! this.props.isAlreadyOnSitesList &&
			! this.props.isFetchingSites,
			queryObject.already_authorized ) {
			this.props.recordTracksEvent( 'calypso_jpc_back_wpadmin_click' );
			return this.props.goBackToWpAdmin( queryObject.redirect_after_auth );
		}

		if ( this.props.isAlreadyOnSitesList &&
			queryObject.already_authorized ) {
			this.props.recordTracksEvent( 'calypso_jpc_already_authorized_click' );
			return this.redirect();
		}

		if ( authorizeSuccess && ! queryObject.already_authorized ) {
			this.props.recordTracksEvent( 'calypso_jpc_activate_click' );
			return this.redirect();
		}
		if ( authorizeError ) {
			this.props.recordTracksEvent( 'calypso_jpc_try_again_click' );
			return this.handleResolve();
		}
		if ( this.props.isAlreadyOnSitesList ) {
			this.props.recordTracksEvent( 'calypso_jpc_return_site_click' );
			return this.redirect();
		}

		this.props.recordTracksEvent( 'calypso_jpc_approve_click' );
		return this.props.authorize( queryObject );
	};

	isAuthorizing() {
		const { isAuthorizing } = this.props.jetpackConnectAuthorize;
		return ( ! this.props.isAlreadyOnSitesList && isAuthorizing );
	}

	renderErrorDetails() {
		const { authorizeError } = this.props.jetpackConnectAuthorize;
		return (
			<div className="jetpack-connect__error-details">
				<FormLabel>{ this.props.translate( 'Error Details' ) }</FormLabel>
				<FormSettingExplanation>
					{ authorizeError.message }
				</FormSettingExplanation>
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
						<NoticeAction onClick={ this.handleResolve }>
							{ translate( 'Try again' ) }
						</NoticeAction>
					</Notice>
				</div>
				<p>
					{ translate(
						'WordPress.com was unable to reach your site and approve the connection. ' +
						'Try again by clicking the button above; ' +
						'if that doesn\'t work you may need to {{link}}contact support{{/link}}.', {
							components: {
								link: <a href="https://jetpack.com/contact-support" target="_blank" rel="noopener noreferrer" />
							}
						}
					) }
				</p>
				{ this.renderErrorDetails() }
			</div>
		);
	}

	renderNotices() {
		const { authorizeError, queryObject, isAuthorizing, authorizeSuccess, userAlreadyConnected } = this.props.jetpackConnectAuthorize;
		if ( queryObject.already_authorized && ! this.props.isFetchingSites && ! this.props.isAlreadyOnSitesList ) {
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

		if ( this.props.authAttempts < MAX_AUTH_ATTEMPTS && this.props.authAttempts > 0 && ! isAuthorizing && ! authorizeSuccess ) {
			return <JetpackConnectNotices noticeType="retryAuth" />;
		}

		if ( ! authorizeError ) {
			return null;
		}

		if ( authorizeError.message.indexOf( 'already_connected' ) >= 0 ) {
			return <JetpackConnectNotices noticeType="alreadyConnected" />;
		}
		if ( this.props.requestHasExpiredSecretError() ) {
			return <JetpackConnectNotices noticeType="secretExpired" siteUrl={ queryObject.site } />;
		}
		if ( this.props.requestHasXmlrpcError() ) {
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
			authorizeError
		} = this.props.jetpackConnectAuthorize;

		if ( ! this.props.isAlreadyOnSitesList &&
			! this.props.isFetchingSites &&
			queryObject.already_authorized ) {
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
				context: 'Shown during a jetpack authorization process, while we retrieve the info we need to show the last page'
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
		const { queryObject } = this.props.jetpackConnectAuthorize;
		const { blogname } = queryObject;

		const detailsLink = (
			<a
				target="_blank"
				rel="noopener noreferrer"
				onClick={ this.handleClickDisclaimer }
				href="https://jetpack.com/support/what-data-does-jetpack-sync/"
				className="jetpack-connect__sso-actions-modal-link" />
		);

		const text = this.props.translate(
			'By connecting your site, you agree to {{detailsLink}}share details{{/detailsLink}} between WordPress.com and %(siteName)s.',
			{
				components: {
					detailsLink
				},
				args: {
					siteName: decodeEntities( blogname )
				}
			}
		);

		return (
			<p className="jetpack-connect__tos-link">
				{ text }
			</p>
		);
	}

	getUserText() {
		const { translate } = this.props;
		const { authorizeSuccess } = this.props.jetpackConnectAuthorize;
		let text = translate( 'Connecting as {{strong}}%(user)s{{/strong}}', {
			args: { user: this.props.user.display_name },
			components: { strong: <strong /> }
		} );

		if ( authorizeSuccess || this.props.isAlreadyOnSitesList ) {
			text = translate( 'Connected as {{strong}}%(user)s{{/strong}}', {
				args: { user: this.props.user.display_name },
				components: { strong: <strong /> }
			} );
		}

		return text;
	}

	isWaitingForConfirmation() {
		const { isAuthorizing, authorizeSuccess, siteReceived } = this.props.jetpackConnectAuthorize;
		return ! ( isAuthorizing || authorizeSuccess || siteReceived );
	}

	getRedirectionTarget() {
		return PLANS_PAGE + this.props.siteSlug;
	}

	renderFooterLinks() {
		const { translate } = this.props;
		const {
			queryObject,
			authorizeSuccess,
			isAuthorizing,
			isRedirectingToWpAdmin
		} = this.props.jetpackConnectAuthorize;
		const { blogname, redirect_after_auth } = queryObject;
		const redirectTo = addQueryArgs( queryObject, window.location.href );
		const backToWpAdminLink = (
			<LoggedOutFormLinkItem icon={ true } href={ redirect_after_auth }>
				<Gridicon size={ 18 } icon="arrow-left" />
				{ translate( 'Return to %(sitename)s', {
					args: { sitename: decodeEntities( blogname ) }
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
						{ translate( 'I\'m not interested in upgrades' ) }
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
				<HelpButton onClick={ this.handleClickHelp } />
			</LoggedOutFormLinks>
		);
	}

	renderStateAction() {
		const { authorizeSuccess, siteReceived } = this.props.jetpackConnectAuthorize;
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
					disabled={ this.isAuthorizing() || this.props.requestHasXmlrpcError() }
					onClick={ this.handleSubmit }
				>
					{ this.getButtonText() }
				</Button>
			</LoggedOutFormFooter>

		);
	}

	render() {
		const { authorizeSuccess } = this.props.jetpackConnectAuthorize;
		return (
			<div className="jetpack-connect__logged-in-form">
				{ this.renderFormHeader( authorizeSuccess ) }
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

export default localize( LoggedInForm );
