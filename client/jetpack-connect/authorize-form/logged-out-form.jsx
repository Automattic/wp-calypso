// @todo fix this lint error
/* eslint wpcalypso/jsx-classname-namespace: 0 */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
const debug = require( 'debug' )( 'calypso:jetpack-connect:authorize-form' );

/**
 * Internal dependencies
 */
import addQueryArgs from 'lib/route/add-query-args';
import StepHeader from 'signup/step-header';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import SignupForm from 'components/signup-form';
import WpcomLoginForm from 'signup/wpcom-login-form';
import config from 'config';
import LocaleSuggestions from 'signup/locale-suggestions';
import versionCompare from 'lib/version-compare';
import HelpButton from '../help-button';
import SiteCard from './site-card';

class LoggedOutForm extends Component {

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jpc_signup_view' );
	}

	renderFormHeader() {
		const headerText = this.props.translate( 'Create your account' );
		const subHeaderText = this.props.translate( 'You are moments away from connecting your site.' );
		const { queryObject } = this.props.jetpackConnectAuthorize;
		const siteCard = versionCompare( queryObject.jp_version, '4.0.3', '>' )
			? <SiteCard queryObject={ queryObject } />
			: null;

		return (
			<div>
				<StepHeader
					headerText={ headerText }
					subHeaderText={ subHeaderText } />
				{ siteCard }
			</div>
		);
	}

	submitForm( form, userData ) {
		debug( 'submiting new account', form, userData );
		this.props.createAccount( userData );
	}

	isSubmitting() {
		return this.props.jetpackConnectAuthorize && this.props.jetpackConnectAuthorize.isAuthorizing;
	}

	loginUser() {
		const { queryObject, userData, bearerToken } = this.props.jetpackConnectAuthorize;
		const redirectTo = addQueryArgs( queryObject, window.location.href );
		return (
			<WpcomLoginForm
				log={ userData.username }
				authorization={ 'Bearer ' + bearerToken }
				redirectTo={ redirectTo } />
		);
	}

	renderLocaleSuggestions() {
		if ( ! this.props.locale ) {
			return;
		}

		return (
			<LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />
		);
	}

	renderFooterLink() {
		const { queryObject } = this.props.jetpackConnectAuthorize;
		const redirectTo = addQueryArgs( queryObject, window.location.href );
		const loginUrl = addQueryArgs( { redirect_to: redirectTo }, config( 'login_url' ) );
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href={ loginUrl }>
					{ this.props.translate( 'Already have an account? Sign in' ) }
				</LoggedOutFormLinkItem>
				<HelpButton onClick={ this.clickHelpButton } />
			</LoggedOutFormLinks>
		);
	}

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
					submitButtonText={ this.props.translate( 'Sign Up and Connect Jetpack' ) }
					footerLink={ this.renderFooterLink() }
					suggestedUsername={ userData && userData.username ? userData.username : '' }
				/>
				{ userData && this.loginUser() }
			</div>
		);
	}
}

export default localize( LoggedOutForm );
