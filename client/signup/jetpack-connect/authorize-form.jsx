/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import page from 'page';
import urlModule from 'url';
import i18n from 'i18n-calypso';
const debug = require( 'debug' )( 'calypso:jetpack-connect:authorize-form' );

/**
 * Internal dependencies
 */
import ConnectHeader from './connect-header';
import Main from 'components/main';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import SignupForm from 'components/signup-form';
import WpcomLoginForm from 'signup/wpcom-login-form';
import config from 'config';
import { createAccount, authorize, goBackToWpAdmin, activateManage } from 'state/jetpack-connect/actions';
import { isCalypsoStartedConnection } from 'state/jetpack-connect/selectors';
import JetpackConnectNotices from './jetpack-connect-notices';
import observe from 'lib/mixins/data-observe';
import userUtilities from 'lib/user/utils';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import Gravatar from 'components/gravatar';
import Gridicon from 'components/gridicon';
import LocaleSuggestions from 'signup/locale-suggestions';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSiteByUrl } from 'state/sites/selectors';
import Spinner from 'components/spinner';
import Site from 'blocks/site';
import { decodeEntities } from 'lib/formatting';
import versionCompare from 'lib/version-compare';
import EmptyContent from 'components/empty-content';
import safeImageUrl from 'lib/safe-image-url';
import Button from 'components/button';
import { requestSites } from 'state/sites/actions';
import { isRequestingSites } from 'state/sites/selectors';
import MainWrapper from './main-wrapper';

/**
 * Constants
 */
const calypsoEnv = config( 'env_id' ) || process.env.NODE_ENV;
const PLANS_PAGE = '/jetpack/connect/plans/';
const authUrl = '/wp-admin/admin.php?page=jetpack&connect_url_redirect=true&calypso_env=' + calypsoEnv;
const JETPACK_CONNECT_TTL = 60 * 60 * 1000; // 1 Hour

const SiteCard = React.createClass( {
	render() {
		const { site_icon, blogname, home_url, site_url } = this.props.queryObject;
		const siteIcon = site_icon ? { img: safeImageUrl( site_icon ) } : false;
		const url = decodeEntities( home_url );
		const parsedUrl = urlModule.parse( url );
		const path = ( parsedUrl.path === '/' ) ? '' : parsedUrl.path;
		const site = {
			ID: null,
			url: url,
			admin_url: decodeEntities( site_url + '/wp-admin' ),
			domain: parsedUrl.host + path,
			icon: siteIcon,
			is_vip: false,
			title: decodeEntities( blogname )
		};

		return (
			<CompactCard className="jetpack-connect__site">
				<Site site={ site } />
			</CompactCard>
		);
	}
} );

const LoggedOutForm = React.createClass( {
	displayName: 'LoggedOutForm',

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jpc_signup_view' );
	},

	renderFormHeader() {
		const headerText = i18n.translate( 'Create your account' );
		const subHeaderText = i18n.translate( 'You are moments away from connecting your site.' );
		const { queryObject } = this.props.jetpackConnectAuthorize;
		const siteCard = versionCompare( queryObject.jp_version, '4.0.3', '>' )
			? <SiteCard queryObject={ queryObject } />
			: null;

		return (
			<div>
				<ConnectHeader
					showLogo={ false }
					headerText={ headerText }
					subHeaderText={ subHeaderText } />
				{ siteCard }
			</div>
		);
	},

	submitForm( form, userData ) {
		debug( 'submiting new account', form, userData );
		this.props.createAccount( userData );
	},

	isSubmitting() {
		return this.props.jetpackConnectAuthorize && this.props.jetpackConnectAuthorize.isAuthorizing;
	},

	loginUser() {
		const { queryObject, userData, bearerToken } = this.props.jetpackConnectAuthorize;
		const extraFields = { jetpack_calypso_login: '1', _wp_nonce: queryObject._wp_nonce };
		return (
			<WpcomLoginForm
				log={ userData.username }
				authorization={ 'Bearer ' + bearerToken }
				extraFields={ extraFields }
				redirectTo={ window.location.href } />
		);
	},

	renderLocaleSuggestions() {
		if ( ! this.props.locale ) {
			return;
		}

		return (
			<LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />
		);
	},

	renderFooterLink() {
		const loginUrl = config( 'login_url' ) + '?redirect_to=' + encodeURIComponent( window.location.href );
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href={ loginUrl }>
					{ this.translate( 'Already have an account? Sign in' ) }
				</LoggedOutFormLinkItem>
			</LoggedOutFormLinks>
		);
	},

	render() {
		const { userData } = this.props.jetpackConnectAuthorize;
		return (
			<div>
				{ this.renderLocaleSuggestions() }
				{ this.renderFormHeader() }
				<SignupForm
					getRedirectToAfterLoginUrl={ window.location.href }
					disabled={ this.isSubmitting() }
					submitting={ this.isSubmitting() }
					save={ this.save }
					submitForm={ this.submitForm }
					submitButtonText={ this.translate( 'Sign Up and Connect Jetpack' ) }
					footerLink={ this.renderFooterLink() } />
				{ userData && this.loginUser() }
			</div>
		);
	}
} );

const LoggedInForm = React.createClass( {
	displayName: 'LoggedInForm',

	getInitialState() {
		return {
			hasRefetchedSites: false
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
			return this.props.authorize( queryObject );
		}
		if ( this.props.isAlreadyOnSitesList && ! this.state.hasRefetchedSites && ! this.props.isFetchingSites() ) {
			this.props.requestSites();
			this.setState( { hasRefetchedSites: true } );
		}
	},

	componentWillReceiveProps( props ) {
		const {
			siteReceived,
			isActivating,
			queryObject,
			isRedirectingToWpAdmin,
			authorizeSuccess
		} = props.jetpackConnectAuthorize;

		// SSO specific logic here.
		if ( props.isSSO ) {
			if ( ! isRedirectingToWpAdmin && authorizeSuccess ) {
				this.props.goBackToWpAdmin( queryObject.redirect_after_auth );
			}
		} else if ( siteReceived && ! isActivating ) {
			this.activateManage();
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
			? <SiteCard queryObject={ queryObject } />
			: null;

		return (
			<div>
				<ConnectHeader
					showLogo={ false }
					headerText={ headerText }
					subHeaderText={ subHeaderText } />
				{ siteCard }
			</div>
		);
	},

	activateManage() {
		const { queryObject, activateManageSecret } = this.props.jetpackConnectAuthorize;
		this.props.activateManage( queryObject.client_id, queryObject.state, activateManageSecret );
		page.redirect( this.getRedirectionTarget() );
	},

	handleSubmit() {
		const {
			queryObject,
			manageActivated,
			activateManageSecret,
			authorizeError
		} = this.props.jetpackConnectAuthorize;

		if ( ! this.props.isAlreadyOnSitesList &&
			queryObject.already_authorized ) {
			return this.props.goBackToWpAdmin( queryObject.redirect_after_auth );
		}
		if ( activateManageSecret && ! manageActivated ) {
			return this.activateManage();
		}
		if ( authorizeError && authorizeError.message.indexOf( 'verify_secrets_missing' ) >= 0 ) {
			window.location.href = queryObject.site + authUrl;
			return;
		}
		if ( this.props.isAlreadyOnSitesList ) {
			return this.props.goBackToWpAdmin( queryObject.redirect_after_auth );
		}

		return this.props.authorize( queryObject );
	},

	handleSignOut() {
		const { queryObject } = this.props.jetpackConnectAuthorize;
		let redirect = window.location.href + '?';
		for ( const prop in queryObject ) {
			redirect += prop + '=' + encodeURIComponent( queryObject[ prop ] ) + '&';
		}
		userUtilities.logout( redirect );
	},

	isAuthorizing() {
		const { isAuthorizing, isActivating } = this.props.jetpackConnectAuthorize;
		return ( ! this.props.isAlreadyOnSitesList && ( isAuthorizing || isActivating ) );
	},

	renderNotices() {
		const { authorizeError, queryObject } = this.props.jetpackConnectAuthorize;
		if ( queryObject.already_authorized && ! this.props.isAlreadyOnSitesList ) {
			return <JetpackConnectNotices noticeType="alreadyConnectedByOtherUser" />;
		}

		if ( ! authorizeError ) {
			return null;
		}
		if ( authorizeError.message.indexOf( 'already_connected' ) >= 0 ) {
			return <JetpackConnectNotices noticeType="alreadyConnected" />;
		}
		if ( authorizeError.message.indexOf( 'verify_secrets_missing' ) >= 0 ) {
			return <JetpackConnectNotices noticeType="secretExpired" siteUrl={ queryObject.site } />;
		}
		return <JetpackConnectNotices noticeType="authorizeError" />;
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
			queryObject.already_authorized ) {
			return this.translate( 'Return to your site' );
		}

		if ( authorizeError && authorizeError.message.indexOf( 'verify_secrets_missing' ) >= 0 ) {
			return this.translate( 'Try again' );
		}

		if ( this.props.isFetchingSites() ) {
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

		if ( isAuthorizing ) {
			return this.translate( 'Authorizing your connection' );
		}

		if ( this.props.isAlreadyOnSitesList ) {
			return this.translate( 'Return to your site' );
		}

		return this.translate( 'Approve' );
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
		const { queryObject } = this.props.jetpackConnectAuthorize;
		const site = queryObject.site;
		const siteSlug = site.replace( /^https?:\/\//, '' ).replace( /\//g, '::' );
		return PLANS_PAGE + siteSlug;
	},

	renderFooterLinks() {
		const { queryObject, authorizeSuccess, isAuthorizing } = this.props.jetpackConnectAuthorize;
		const { blogname, redirect_after_auth, _wp_nonce } = queryObject;
		const loginUrl = config( 'login_url' ) +
			'?jetpack_calypso_login=1&redirect_to=' + encodeURIComponent( window.location.href ) +
			'&_wp_nonce=' + encodeURIComponent( _wp_nonce );
		const backToWpAdminLink = (
			<LoggedOutFormLinkItem icon={ true } href={ redirect_after_auth }>
				<Gridicon size={ 18 } icon="arrow-left" />
				{ this.translate( 'Return to %(sitename)s', {
					args: { sitename: decodeEntities( blogname ) }
				} ) }
			</LoggedOutFormLinkItem>
		);

		if ( isAuthorizing ) {
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
			</LoggedOutFormLinks>
		);
	},

	renderStateAction() {
		const { authorizeSuccess, siteReceived } = this.props.jetpackConnectAuthorize;
		if ( this.props.isFetchingSites() || this.isAuthorizing() || ( authorizeSuccess && ! siteReceived ) ) {
			return (
				<div className="jetpack-connect-logged-in-form__loading">
					<span>{ this.getButtonText() }</span> <Spinner size={ 20 } duration={ 3000 } />
				</div>
			);
		}
		return (
			<Button primary disabled={ this.isAuthorizing() } onClick={ this.handleSubmit }>
				{ this.getButtonText() }
			</Button>
		);
	},

	render() {
		const { authorizeSuccess } = this.props.jetpackConnectAuthorize;
		return (
			<div className="jetpack-connect-logged-in-form">
				{ this.renderFormHeader( authorizeSuccess ) }
				<Card>
					<Gravatar user={ this.props.user } size={ 64 } />
					<p className="jetpack-connect-logged-in-form__user-text">{ this.getUserText() }</p>
					{ this.renderNotices() }
					{ this.renderStateAction() }
				</Card>
				{ this.renderFooterLinks() }
			</div>
		);
	}
} );

const JetpackConnectAuthorizeForm = React.createClass( {
	displayName: 'JetpackConnectAuthorizeForm',
	mixins: [ observe( 'userModule' ) ],

	isSSO() {
		const site = this.props.jetpackConnectAuthorize.queryObject.site.replace( /.*?:\/\//g, '' );
		if ( this.props.jetpackSSOSessions && this.props.jetpackSSOSessions[ site ] ) {
			const currentTime = ( new Date() ).getTime();
			const sessionTimestamp = this.props.jetpackSSOSessions[ site ].timestamp || 0;
			return ( currentTime - sessionTimestamp < JETPACK_CONNECT_TTL );
		}

		return false;
	},

	renderNoQueryArgsError() {
		return (
			<Main>
				<EmptyContent
					illustration="/calypso/images/drake/drake-whoops.svg"
					title={ this.translate(
						'Oops, this URL should not be accessed directly'
					) }
					action={ this.translate( 'Get back to Jetpack Connect screen' ) }
					actionURL="/jetpack/connect"
				/>
			</Main>
		);
	},

	renderForm() {
		const { userModule } = this.props;
		const user = userModule.get();
		const props = Object.assign( {}, this.props, {
			user: user
		} );
		const calypsoStartedConnection = isCalypsoStartedConnection(
			this.props.jetpackConnectSessions,
			this.props.jetpackConnectAuthorize.queryObject.site
		);

		return (
			( user )
				? <LoggedInForm { ...props } calypsoStartedConnection={ calypsoStartedConnection } isSSO={ this.isSSO() } />
				: <LoggedOutForm { ...props } isSSO={ this.isSSO() } />
		);
	},
	render() {
		const { queryObject } = this.props.jetpackConnectAuthorize;
		if ( typeof queryObject === 'undefined' ) {
			return this.renderNoQueryArgsError();
		}

		return (
			<MainWrapper>
				<div className="jetpack-connect__authorize-form">
					{ this.renderForm() }
				</div>
			</MainWrapper>
		);
	}
} );

export default connect(
	state => {
		const site = state.jetpackConnect.jetpackConnectAuthorize &&
				state.jetpackConnect.jetpackConnectAuthorize.queryObject &&
				state.jetpackConnect.jetpackConnectAuthorize.queryObject.site
			? getSiteByUrl( state, state.jetpackConnect.jetpackConnectAuthorize.queryObject.site )
			: null;
		const isFetchingSites = () => {
			return isRequestingSites( state );
		};
		return {
			jetpackConnectAuthorize: state.jetpackConnect.jetpackConnectAuthorize,
			jetpackSSOSessions: state.jetpackConnect.jetpackSSOSessions,
			jetpackConnectSessions: state.jetpackConnect.jetpackConnectSessions,
			isAlreadyOnSitesList: !! site,
			isFetchingSites
		};
	},
	dispatch => bindActionCreators( { requestSites,
		recordTracksEvent,
		authorize,
		createAccount,
		activateManage,
		goBackToWpAdmin }, dispatch )
)( JetpackConnectAuthorizeForm );
