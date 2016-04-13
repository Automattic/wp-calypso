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
import Notices from 'notices';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import Gravatar from 'components/gravatar';

/**
 * Module variables
 */
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
		)
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
		if ( autoAuthorize ) {
			this.props.authorize( queryObject );
		}
	},

	componentDidUpdate() {
		const { authorizeSuccess, queryObject, siteReceived, plansURL } = this.props.jetpackConnectAuthorize;
		if ( authorizeSuccess && siteReceived && plansURL ) {
			Notices.info(
				this.translate( 'We thought you would enjoy these upgrades.' ),
				{
					button: this.translate( 'Skip upgrade and return to your site' ),
					href: queryObject.redirect_after_auth,
					persistent: true
				}
			);
			page( plansURL );
		}
	},

	handleSubmit() {
		const { queryObject } = this.props.jetpackConnectAuthorize;
		this.props.authorize( queryObject );
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
		const { authorizeError, authorizeSuccess } = this.props.jetpackConnectAuthorize;
		if ( authorizeError ) {
			return <JetpackConnectNotices noticeType="authorizeError" />;
		}
		if ( authorizeSuccess ) {
			return <JetpackConnectNotices noticeType="authorizeSuccess" />;
		}
		return null;
	},

	renderFormControls() {
		const { isAuthorizing, autoAuthorize, authorizeSuccess } = this.props.jetpackConnectAuthorize;

		if ( autoAuthorize ) {
			return isAuthorizing
				? <p>{ this.translate( 'Authorizing your Jetpack connection' ) }</p>
				: null
		}

		if ( authorizeSuccess ) {
			return null;
		}

		return (
			<button disabled={ this.isAuthorizing() } onClick={ this.handleSubmit } className="button is-primary">
				{ this.translate( 'Approve' ) }
			</button>
		);
	},

	renderFooterLinks() {
		const { queryObject, autoAuthorize, authorizeSuccess } = this.props.jetpackConnectAuthorize;
		const loginUrl = config( 'login_url' ) + '?jetpack_calypso_login=1&redirect_to=' + encodeURIComponent( window.location.href ) + '&_wp_nonce=' + encodeURIComponent( queryObject._wp_nonce );

		if ( autoAuthorize || authorizeSuccess ) {
			return null;
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
		return (
			<div className="jetpack-connect-logged-in-form">
				<Card>
					<Gravatar user={ this.props.user } size={ 64 } />
					<p className="jetpack-connect-logged-in-form__user-text">{
						this.translate( 'Connecting as {{strong}}%(user)s{{/strong}}', {
							args: { user: this.props.user.display_name },
							components: { strong: <strong /> }
						} )
					}</p>
					{ this.renderNotices() }
					{ this.renderFormControls() }
				</Card>
				{ this.renderFooterLinks() }
			</div>
		);
	}
} );

const JetpackConnectAuthorizeForm = React.createClass( {
	displayName: 'JetpackConnectAuthorizeForm',
	mixins: [ observe( 'userModule' ) ],
	renderFormHeader() {
		const { site } = this.props.jetpackConnectAuthorize.queryObject;
		return( <CompactCard className="jetpack-connect__authorize-form-header">{ site }</CompactCard> );
	},
	renderForm() {
		const { userModule } = this.props;
		let user = userModule.get();
		return ( user )
			? <LoggedInForm { ...this.props } user={ user } />
			: <LoggedOutForm { ...this.props } />
	},
	render() {
		return (
			<Main className="jetpack-connect">
				<div className="jetpack-connect__authorize-form">
					<ConnectHeader headerText={ this.translate( 'Connect a self-hosted WordPress' ) }
						subHeaderText={ this.translate( 'Jetpack would like to connect to your WordPress.com account' ) } />
					{ this.renderFormHeader() }
					{ this.renderForm() }
				</div>
			</Main>
		);
	}
} );

export default connect(
	state => {
		return {
			jetpackConnectAuthorize: state.jetpackConnect.jetpackConnectAuthorize
		};
	},
	dispatch => bindActionCreators( { authorize, createAccount }, dispatch )
)( JetpackConnectAuthorizeForm );

