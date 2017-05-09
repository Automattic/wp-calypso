/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import debugModule from 'debug';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HelpButton from './help-button';
import { login } from 'lib/paths';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import addQueryArgs from 'lib/route/add-query-args';
import LocaleSuggestions from 'signup/locale-suggestions';
import SignupForm from 'components/signup-form';
import WpcomLoginForm from 'signup/wpcom-login-form';
import versionCompare from 'lib/version-compare';
import StepHeader from '../step-header';
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

	handleSubmitSignup = ( form, userData ) => {
		debug( 'submiting new account', form, userData );
		this.props.createAccount( userData );
	}

	isSubmitting() {
		return this.props.jetpackConnectAuthorize && this.props.jetpackConnectAuthorize.isAuthorizing;
	}

	renderLoginUser() {
		const { queryObject, userData, bearerToken } = this.props.jetpackConnectAuthorize;
		const redirectTo = addQueryArgs( queryObject, window.location.href );
		return (
			<WpcomLoginForm
				log={ userData.username }
				authorization={ 'Bearer ' + bearerToken }
				redirectTo={ redirectTo } />
		);
	}

	renderFormHeader() {
		const { translate } = this.props;
		const headerText = translate( 'Create your account' );
		const subHeaderText = translate( 'You are moments away from connecting your site.' );
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

		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href={ login( { redirectTo } ) }>
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
					submitForm={ this.handleSubmitSignup }
					submitButtonText={ this.props.translate( 'Sign Up and Connect Jetpack' ) }
					footerLink={ this.renderFooterLink() }
					suggestedUsername={ userData && userData.username ? userData.username : '' }
				/>
				{ userData && this.renderLoginUser() }
			</div>
		);
	}
}

export default localize( LoggedOutForm );
