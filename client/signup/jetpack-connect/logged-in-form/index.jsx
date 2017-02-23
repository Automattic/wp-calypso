/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import i18n from 'i18n-calypso';
import Gridicon from 'gridicons';
const debug = require( 'debug' )( 'calypso:jetpack-connect:authorize-form' );

/**
 * Internal dependencies
 */
import addQueryArgs from 'lib/route/add-query-args';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import versionCompare from 'lib/version-compare';
import SiteCard from '../jetpack-site-card';
import StepHeader from '../../step-header';
import config from 'config';
import HelpButton from '../help-button';
import JetpackConnectNotices from '../jetpack-connect-notices';
import userUtilities from 'lib/user/utils';
import Card from 'components/card';
import Gravatar from 'components/gravatar';
import Spinner from 'components/spinner';
import { decodeEntities } from 'lib/formatting';
import Button from 'components/button';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { externalRedirect } from 'lib/route/path';

/**
 * Constants
 */
const PLANS_PAGE = '/jetpack/connect/plans/';
const MAX_AUTH_ATTEMPTS = 3;

const LoggedInForm = React.createClass( {
	displayName: 'LoggedInForm',

	getInitialState() {
		return {
			haveAuthorized: false
		};
	},

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
	},

	componentWillReceiveProps( props ) {
		const {
			authorizationCode,
			siteReceived,
			isActivating,
			queryObject,
			isRedirectingToWpAdmin,
			authorizeSuccess,
			authorizeError
		} = props.jetpackConnectAuthorize;

		// SSO specific logic here.
		if ( props.isSSO ) {
			if ( ! isRedirectingToWpAdmin && authorizeSuccess ) {
				return this.props.goBackToWpAdmin( queryObject.redirect_after_auth );
			}
		} else if (
			props.plansFirst &&
			props.selectedPlan &&
			! this.state.haveAuthorized &&
			! this.isAuthorizing()
		) {
			this.setState( { haveAuthorized: true } );
			this.props.authorize( queryObject );
		} else if ( siteReceived && ! isActivating ) {
			return this.activateManageAndRedirect();
		} else if ( props.isAlreadyOnSitesList && queryObject.already_authorized && ! isActivating ) {
			return this.activateManageAndRedirect();
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
		if ( props.isAlreadyOnSitesList && ! queryObject.already_authorized && ! props.isFetchingSites && ! this.retryingAuth ) {
			this.retryingAuth = true;
			return this.props.goToXmlrpcErrorFallbackUrl( queryObject, authorizationCode );
		}
	},

	renderFormHeader( isConnected ) {
		const { queryObject } = this.props.jetpackConnectAuthorize;
		const headerText = ( isConnected )
			? i18n.translate( 'You are connected!' )
			: i18n.translate( 'Completing connection' );
		const subHeaderText = ( isConnected )
			? i18n.translate( 'Thank you for flying with Jetpack' )
			: i18n.translate( 'Jetpack is finishing up the connection process' );
		const siteCard = versionCompare( queryObject.jp_version, '4.0.3', '>' )
			? <SiteCard { ...queryObject } />
			: null;

		return (
			<div>
				<StepHeader
					headerText={ headerText }
					subHeaderText={ subHeaderText } />
				{ siteCard }
			</div>
		);
	},

	activateManageAndRedirect() {
		const { queryObject, activateManageSecret } = this.props.jetpackConnectAuthorize;
		debug( 'Activating Manage module and calculating redirection', queryObject );
		this.props.activateManage( queryObject.client_id, queryObject.state, activateManageSecret );
		if ( 'jpo' === queryObject.from || this.props.isSSO ) {
			this.props.goBackToWpAdmin( queryObject.redirect_after_auth );
		} else {
			page.redirect( this.getRedirectionTarget() );
		}
	},

	handleSubmit() {
		const {
			queryObject,
			manageActivated,
			activateManageSecret,
			authorizeError
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
			return this.activateManageAndRedirect();
		}

		if ( activateManageSecret && ! manageActivated ) {
			this.props.recordTracksEvent( 'calypso_jpc_activate_click' );
			return this.activateManageAndRedirect();
		}
		if ( authorizeError ) {
			this.props.recordTracksEvent( 'calypso_jpc_try_again_click' );
			return this.handleResolve();
		}
		if ( this.props.isAlreadyOnSitesList ) {
			this.props.recordTracksEvent( 'calypso_jpc_return_site_click' );
			return this.activateManageAndRedirect();
		}

		this.props.recordTracksEvent( 'calypso_jpc_approve_click' );
		return this.props.authorize( queryObject );
	},

	handleSignOut() {
		const { queryObject } = this.props.jetpackConnectAuthorize;
		const redirect = addQueryArgs( queryObject, window.location.href );
		this.props.recordTracksEvent( 'calypso_jpc_signout_click' );
		userUtilities.logout( redirect );
	},

	isAuthorizing() {
		const { isAuthorizing, isActivating } = this.props.jetpackConnectAuthorize;
		return ( ! this.props.isAlreadyOnSitesList && ( isAuthorizing || isActivating ) );
	},

	handleResolve() {
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
	},

	renderErrorDetails() {
		const { authorizeError } = this.props.jetpackConnectAuthorize;
		return (
			<div className="jetpack-connect__error-details">
				<FormLabel>{ this.translate( 'Error Details' ) }</FormLabel>
				<FormSettingExplanation>
					{ authorizeError.message }
				</FormSettingExplanation>
			</div>
		);
	},

	renderXmlrpcFeedback() {
		const xmlrpcErrorText = this.translate( 'We had trouble connecting.' );
		return (
			<div>
				<div className="jetpack-connect__notices-container">
					<Notice icon="notice" status="is-error" text={ xmlrpcErrorText } showDismiss={ false }>
						<NoticeAction onClick={ this.handleResolve }>
							{ this.translate( 'Try again' ) }
						</NoticeAction>
					</Notice>
				</div>
				<p>
					{ this.translate(
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
	},

	renderNotices() {
		const { authorizeError, queryObject, isAuthorizing, authorizeSuccess } = this.props.jetpackConnectAuthorize;
		if ( queryObject.already_authorized && ! this.props.isFetchingSites && ! this.props.isAlreadyOnSitesList ) {
			return <JetpackConnectNotices noticeType="alreadyConnectedByOtherUser" />;
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
	},

	getButtonText() {
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
			return this.translate( 'Go back to your site' );
		}

		if ( authorizeError && ! this.retryingAuth ) {
			return this.translate( 'Try again' );
		}

		if ( this.props.isFetchingSites ) {
			return this.translate( 'Preparing authorization' );
		}

		if ( authorizeSuccess && isRedirectingToWpAdmin ) {
			return this.translate( 'Returning to your site' );
		}

		if ( authorizeSuccess ) {
			return this.translate( 'Finishing up!', {
				context: 'Shown during a jetpack authorization process, while we retrieve the info we need to show the last page'
			} );
		}

		if ( isAuthorizing || this.retryingAuth ) {
			return this.translate( 'Authorizing your connection' );
		}

		if ( this.props.isAlreadyOnSitesList ) {
			return this.translate( 'Return to your site' );
		}

		if ( ! this.retryingAuth ) {
			return this.translate( 'Approve' );
		}
	},

	onClickDisclaimerLink() {
		this.props.recordTracksEvent( 'calypso_jpc_disclaimer_link_click' );
	},

	getDisclaimerText() {
		const { queryObject } = this.props.jetpackConnectAuthorize;
		const { blogname } = queryObject;

		const detailsLink = (
			<a
				target="_blank"
				rel="noopener noreferrer"
				onClick={ this.onClickDisclaimerLink }
				href="https://jetpack.com/support/what-data-does-jetpack-sync/"
				className="jetpack-connect__sso-actions-modal-link" />
		);

		const text = this.translate(
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
	},

	getUserText() {
		const { authorizeSuccess } = this.props.jetpackConnectAuthorize;
		let text = this.translate( 'Connecting as {{strong}}%(user)s{{/strong}}', {
			args: { user: this.props.user.display_name },
			components: { strong: <strong /> }
		} );

		if ( authorizeSuccess || this.props.isAlreadyOnSitesList ) {
			text = this.translate( 'Connected as {{strong}}%(user)s{{/strong}}', {
				args: { user: this.props.user.display_name },
				components: { strong: <strong /> }
			} );
		}

		return text;
	},

	isWaitingForConfirmation() {
		const { isAuthorizing, authorizeSuccess, siteReceived } = this.props.jetpackConnectAuthorize;
		return ! ( isAuthorizing || authorizeSuccess || siteReceived );
	},

	getRedirectionTarget() {
		return PLANS_PAGE + this.props.siteSlug;
	},

	renderFooterLinks() {
		const {
			queryObject,
			authorizeSuccess,
			isAuthorizing,
			isRedirectingToWpAdmin
		} = this.props.jetpackConnectAuthorize;
		const { blogname, redirect_after_auth } = queryObject;
		const redirectTo = addQueryArgs( queryObject, window.location.href );
		const loginUrl = addQueryArgs( { redirect_to: redirectTo }, config( 'login_url' ) );
		const backToWpAdminLink = (
			<LoggedOutFormLinkItem icon={ true } href={ redirect_after_auth }>
				<Gridicon size={ 18 } icon="arrow-left" />
				{ this.translate( 'Return to %(sitename)s', {
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
						{ this.translate( 'I\'m not interested in upgrades' ) }
					</LoggedOutFormLinkItem>
				</LoggedOutFormLinks>
			);
		}

		return (
			<LoggedOutFormLinks>
				{ this.isWaitingForConfirmation() ? backToWpAdminLink : null }
				<LoggedOutFormLinkItem href={ loginUrl }>
					{ this.translate( 'Sign in as a different user' ) }
				</LoggedOutFormLinkItem>
				<LoggedOutFormLinkItem onClick={ this.handleSignOut }>
					{ this.translate( 'Create a new account' ) }
				</LoggedOutFormLinkItem>
				<HelpButton onClick={ this.clickHelpButton } />
			</LoggedOutFormLinks>
		);
	},

	clickHelpButton() {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	},

	renderStateAction() {
		const { authorizeSuccess, siteReceived } = this.props.jetpackConnectAuthorize;
		if (
			this.props.isFetchingSites ||
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
	},

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
} );

export default LoggedInForm;
