/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import debugModule from 'debug';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import HelpButton from './help-button';
import { login } from 'lib/paths';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import addQueryArgs from 'lib/route/add-query-args';
import LocaleSuggestions from 'components/locale-suggestions';
import SignupForm from 'components/signup-form';
import WpcomLoginForm from 'signup/wpcom-login-form';
import versionCompare from 'lib/version-compare';
import FormattedHeader from 'components/formatted-header';
import SiteCard from './site-card';

const debug = debugModule( 'calypso:jetpack-connect:authorize-form' );

class LoggedOutForm extends Component {
	static propTypes = {
		createAccount: PropTypes.func.isRequired,
		jetpackConnectAuthorize: PropTypes.shape( {
			bearerToken: PropTypes.string,
			isAuthorizing: PropTypes.bool,
			queryObject: PropTypes.object.isRequired,
			userData: PropTypes.object,
		} ).isRequired,
		locale: PropTypes.string,
		path: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jpc_signup_view' );
	}

	getRedirectAfterLoginUrl() {
		const { queryObject } = this.props.jetpackConnectAuthorize;
		return addQueryArgs( queryObject, window.location.href );
	}

	handleSubmitSignup = ( form, userData ) => {
		debug( 'submiting new account', form, userData );
		this.props.createAccount( userData );
	};

	handleClickHelp = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	}

	renderLoginUser() {
		const { userData, bearerToken, queryObject } = this.props.jetpackConnectAuthorize;

		return (
			<WpcomLoginForm
				log={ userData.username }
				authorization={ 'Bearer ' + bearerToken }
				emailAddress={ queryObject.user_email }
				redirectTo={ this.getRedirectAfterLoginUrl() } />
		);
	}

	renderFormHeader() {
		const { translate, isAlreadyOnSitesList } = this.props;
		const headerText = translate( 'Create your account' );
		const subHeaderText = translate( 'You are moments away from connecting your site.' );
		const { queryObject } = this.props.jetpackConnectAuthorize;
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

	renderLocaleSuggestions() {
		return this.props.locale
			? <LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />
			: null;
	}

	renderFooterLink() {
		const redirectTo = this.getRedirectAfterLoginUrl();
		const emailAddress = this.props.jetpackConnectAuthorize.queryObject.user_email;

		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem
					href={ login( { isNative: config.isEnabled( 'login/native-login-links' ), redirectTo, emailAddress } ) }>
					{ this.props.translate( 'Already have an account? Sign in' ) }
				</LoggedOutFormLinkItem>
				<HelpButton onClick={ this.handleClickHelp } />
			</LoggedOutFormLinks>
		);
	}

	render() {
		const {
			isAuthorizing,
			userData,
			queryObject,
		} = this.props.jetpackConnectAuthorize;

		return (
			<div>
				{ this.renderLocaleSuggestions() }
				{ this.renderFormHeader() }
				<SignupForm
					redirectToAfterLoginUrl={ this.getRedirectAfterLoginUrl() }
					disabled={ isAuthorizing }
					submitting={ isAuthorizing }
					submitForm={ this.handleSubmitSignup }
					submitButtonText={ this.props.translate( 'Sign Up and Connect Jetpack' ) }
					footerLink={ this.renderFooterLink() }
					email={ queryObject.user_email }
					suggestedUsername={ get( userData, 'username', '' ) }
				/>
				{ userData && this.renderLoginUser() }
			</div>
		);
	}
}

export default localize( LoggedOutForm );
