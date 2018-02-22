/** @format */
/**
 * Component which handle remote credentials for installing Jetpack
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * External dependencies
 */
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormattedHeader from 'components/formatted-header';
import FormPasswordInput from 'components/forms/form-password-input';
import HelpButton from './help-button';
import JetpackLogo from 'components/jetpack-logo';
import LoggedOutForm from 'components/logged-out-form';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import MainWrapper from './main-wrapper';
import Spinner from 'components/spinner';
import { jetpackRemoteInstall } from 'state/jetpack-remote-install/actions';
import { getJetpackRemoteInstallError, isJetpackRemoteInstallComplete } from 'state/selectors';
import { getConnectingSite } from 'state/jetpack-connect/selectors';

export class OrgCredentialsForm extends Component {
	state = {
		username: '',
		password: '',
		submitting: false,
	};

	getInitialFields() {
		return {
			username: '',
			password: '',
			submitting: false,
		};
	}

	handleSubmit = event => {
		const { installError, isResponseCompleted, siteToConnect } = this.props;
		event.preventDefault();

		if ( this.state.submitting ) {
			return;
		}
		this.setState( { submitting: true } );

		const url = siteToConnect;
		const username = this.state.username;
		const password = this.state.password;

		this.props.jetpackRemoteInstall( url, username, password );
		if ( isResponseCompleted ) {
			//redirect to auth
		}
		if ( installError ) {
			//handle error
		}

		return;
	}

	getChangeHandler = field => event => {
		this.setState( { [ field ]: event.target.value } );
	};
	getHeaderImage() {
		return (
			<div className="jetpack-connect__auth-form-header-image">
				<JetpackLogo full size={ 45 } />
			</div>
		);
	}

	getHeaderText() {
		const { translate } = this.props;

		return translate( 'Add your website credentials' );
	}

	getSubHeaderText() {
		const { translate } = this.props;

		return (
			<div className="jetpack-connect__install-step">
				{ translate(
					'Add your WordPress administrator credentials' +
						'for this site. Your credentials will not be stored and are used for the purpose' +
						'of installing Jetpack securely. You can also skip this step entirely and install Jetpack manually.'
				) }
			</div>
		);
	}

	formFields() {
		return (
			<div>
				{ }
				<FormLabel htmlFor="username">{ this.props.translate( 'Username' ) }</FormLabel>
				<FormTextInput
					autoCapitalize="off"
					autoCorrect="off"
					className="credentials--form__input"
					disabled={ this.state.submitting }
					id="username"
					name="username"
					onChange={ this.getChangeHandler( 'username' ) }
					value={ this.state.username || '' }
				/>

				<FormLabel htmlFor="password">{ this.props.translate( 'Password' ) }</FormLabel>
				<FormPasswordInput
					className="credentials--form__input"
					disabled={ this.state.submitting }
					id="password"
					name="password"
					onChange={ this.getChangeHandler( 'password' ) }
					value={ this.state.password || '' }
				/>
			</div>
		);
	}

	formFooter() {
		const { translate } = this.props;
		return (
			<LoggedOutFormFooter>
				<FormButton
					className="credentials--form__submit"
					disabled={ ! this.state.username || ! this.state.password }
				>
					{ translate( 'Install Jetpack' ) }
				</FormButton>
			</LoggedOutFormFooter>
		);
	}

	formHeader() {
		return (
			<div>
				{ this.getHeaderImage() }
				{ this.renderHeadersText() }
			</div>
		);
	}

	handleHelpButtonClick() {
		//do something
	}

	footerLink() {
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem>
					{ this.props.translate( 'Install Jetpack manually.' ) }
				</LoggedOutFormLinkItem>
				<HelpButton
					onClick={ this.handleHelpButtonClick }
					label={ 'Get help connecting your site.' }
				/>
			</LoggedOutFormLinks>
		);
	}

	renderHeadersText() {
		return (
			<FormattedHeader
				headerText={ this.getHeaderText() }
				subHeaderText={ this.getSubHeaderText() }
			/>
		);
	}

	render() {
		return (
			<MainWrapper>
				<div className="jetpack-connect__authorize-form">
					{ this.formHeader() }

					<div className="credentials-form">
						<LoggedOutForm onSubmit={ this.handleSubmit }>
							{ this.formFields() }
							{ this.formFooter() }
						</LoggedOutForm>
						{ this.footerLink() }
					</div>
				</div>
			</MainWrapper>
		);
	}
}

export default connect( state => {
	const jetpackConnectSite = getConnectingSite( state );
	const siteToConnect = jetpackConnectSite.url;
	const installError = getJetpackRemoteInstallError( state, siteToConnect );
	const isResponseCompleted = isJetpackRemoteInstallComplete( state, siteToConnect );
	return {
		installError,
		isResponseCompleted,
		siteToConnect,
	};
},
{ jetpackRemoteInstall } )( localize( OrgCredentialsForm ) );
