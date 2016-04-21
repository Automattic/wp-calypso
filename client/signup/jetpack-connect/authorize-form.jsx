/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import page from 'page';
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
import { createAccount, authorize } from 'state/jetpack-connect/actions';
import JetpackConnectNotices from './jetpack-connect-notices';
import observe from 'lib/mixins/data-observe';
import userUtilities from 'lib/user/utils';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import Gravatar from 'components/gravatar';
import i18n from 'lib/mixins/i18n';

/**
 * Module variables
 */
const renderFormHeader = ( site, isConnected = false ) => {
	const headerText = ( isConnected )
		? i18n.translate( 'You are connected!' )
		: i18n.translate( 'Connect your self-hosted WordPress' );
	const subHeaderText = ( isConnected )
		? i18n.translate( 'The power of WordPress.com is yours to command.' )
		: i18n.translate( 'Jetpack would like to connect to your WordPress.com account' );
	return(
		<div>
			<ConnectHeader headerText={ headerText }
					subHeaderText={ subHeaderText } />
			<CompactCard className="jetpack-connect__authorize-form-header">{ site }</CompactCard>
		</div>
	);
};

const LoggedOutForm = React.createClass( {
	displayName: 'LoggedOutForm',

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
		const { site } = this.props.jetpackConnectAuthorize.queryObject;
		return (
			<div>
				{ renderFormHeader( site ) }
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

	componentWillMount() {
		const { autoAuthorize, queryObject } = this.props.jetpackConnectAuthorize;
		debug( 'Checking for auto-auth on mount', autoAuthorize );
		if ( autoAuthorize || this.isCalypsoStartedConnection() ) {
			this.props.authorize( queryObject );
		}
	},

	handleSubmit() {
		const { queryObject, siteReceived, plansURL } = this.props.jetpackConnectAuthorize;
		if ( siteReceived && plansURL ) {
			page( plansURL );
		} else {
			this.props.authorize( queryObject );
		}
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
		return this.props.jetpackConnectAuthorize && this.props.jetpackConnectAuthorize.isAuthorizing;
	},

	renderNotices() {
		const { authorizeError } = this.props.jetpackConnectAuthorize;
		if ( authorizeError ) {
			return <JetpackConnectNotices noticeType="authorizeError" />;
		}
		return null;
	},

	getButtonText() {
		const { isAuthorizing, authorizeSuccess, siteReceived } = this.props.jetpackConnectAuthorize;

		if ( siteReceived ) {
			return this.translate( 'Browse Available Upgrades' );
		}

		if ( authorizeSuccess ) {
			return this.translate( 'Searching Available Upgrades' );
		}

		if ( isAuthorizing ) {
			return this.translate( 'Authorizing' );
		}

		return this.translate( 'Approve' );
	},

	getUserText() {
		const { authorizeSuccess } = this.props.jetpackConnectAuthorize;
		let text = this.translate( 'Connecting as {{strong}}%(user)s{{/strong}}', {
			args: { user: this.props.user.display_name },
			components: { strong: <strong /> }
		} );

		if ( authorizeSuccess ) {
			text = this.translate( 'Connected as {{strong}}%(user)s{{/strong}}', {
				args: { user: this.props.user.display_name },
				components: { strong: <strong /> }
			} );
		}

		return text;
	},

	isCalypsoStartedConnection() {
		const site = this.props.jetpackConnectAuthorize.queryObject.site.replace( /.*?:\/\//g, '' );
		if ( this.props.jetpackConnectSessions && this.props.jetpackConnectSessions[ site ] ) {
			const currentTime = ( new Date() ).getTime();
			const oneDay = 24 * 60 * 60;
			return ( currentTime - this.props.jetpackConnectSessions[ site ] < oneDay );
		}
		return false;
	},

	renderFooterLinks() {
		const { queryObject, authorizeSuccess, isAuthorizing } = this.props.jetpackConnectAuthorize;
		const loginUrl = config( 'login_url' ) + '?jetpack_calypso_login=1&redirect_to=' + encodeURIComponent( window.location.href ) + '&_wp_nonce=' + encodeURIComponent( queryObject._wp_nonce );

		if ( isAuthorizing ) {
			return null;
		}

		if ( authorizeSuccess ) {
			return (
				<LoggedOutFormLinks>
					<LoggedOutFormLinkItem href={ queryObject.redirect_after_auth }>
						{ this.translate( 'I\'m not interested in upgrades' ) }
					</LoggedOutFormLinkItem>
				</LoggedOutFormLinks>
			);
		}

		return(
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href={ loginUrl }>
					{ this.translate( 'Sign in as a different user' ) }
				</LoggedOutFormLinkItem>
				<LoggedOutFormLinkItem onClick={ this.handleSignOut }>
					{ this.translate( 'Create a new account' ) }
				</LoggedOutFormLinkItem>
			</LoggedOutFormLinks>
		);
	},

	render() {
		const { authorizeSuccess } = this.props.jetpackConnectAuthorize;
		const { site } = this.props.jetpackConnectAuthorize.queryObject;
		return (
			<div className="jetpack-connect-logged-in-form">
				{ renderFormHeader( site, authorizeSuccess ) }
				<Card>
					<Gravatar user={ this.props.user } size={ 64 } />
					<p className="jetpack-connect-logged-in-form__user-text">{ this.getUserText() }</p>
					{ this.renderNotices() }
					<button disabled={ this.isAuthorizing() } onClick={ this.handleSubmit } className="button is-primary">
						{ this.getButtonText() }
					</button>
				</Card>
				{ this.renderFooterLinks() }
			</div>
		);
	}
} );

const JetpackConnectAuthorizeForm = React.createClass( {
	displayName: 'JetpackConnectAuthorizeForm',
	mixins: [ observe( 'userModule' ) ],
	renderForm() {
		const { userModule } = this.props;
		let user = userModule.get();
		const props = Object.assign( {}, this.props, {
			user: user
		} );
		return (
			( user )
				? <LoggedInForm { ...props } />
				: <LoggedOutForm { ...props } />
		);
	},
	render() {
		return (
			<Main className="jetpack-connect">
				<div className="jetpack-connect__authorize-form">
					{ this.renderForm() }
				</div>
			</Main>
		);
	}
} );

export default connect(
	state => {
		return {
			jetpackConnectAuthorize: state.jetpackConnect.jetpackConnectAuthorize,
			jetpackConnectSessions: state.jetpackConnect.jetpackConnectSessions
		};
	},
	dispatch => bindActionCreators( { authorize, createAccount }, dispatch )
)( JetpackConnectAuthorizeForm );

