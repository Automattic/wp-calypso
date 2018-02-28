/** @format */
/**
 * Component which handle remote credentials for installing Jetpack
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
/**
 * External dependencies
 */
import Button from 'components/button';
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormattedHeader from 'components/formatted-header';
import FormPasswordInput from 'components/forms/form-password-input';
import HelpButton from './help-button';
import JetpackLogo from 'components/jetpack-logo';
import LoggedOutForm from 'components/logged-out-form';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import MainWrapper from './main-wrapper';
import { addCalypsoEnvQueryArg } from './utils';
import { externalRedirect } from 'lib/route';
import { jetpackRemoteInstall } from 'state/jetpack-remote-install/actions';
import { getJetpackRemoteInstallError, isJetpackRemoteInstallComplete } from 'state/selectors';
import { getConnectingSite } from 'state/jetpack-connect/selectors';
import { REMOTE_PATH_AUTH } from './constants';

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
		const { siteToConnect } = this.props;
		event.preventDefault();

		if ( this.state.submitting ) {
			return;
		}
		this.setState( { submitting: true } );

		this.props.jetpackRemoteInstall( siteToConnect, this.state.username, this.state.password );
	};

	componentDidUpdate() {
		const { installError, isResponseCompleted, siteToConnect } = this.props;

		if ( isResponseCompleted ) {
			externalRedirect( addCalypsoEnvQueryArg( siteToConnect + REMOTE_PATH_AUTH ) );
		}
		if ( installError ) {
			//handle errors
		}
	}

	getChangeHandler = field => event => {
		this.setState( { [ field ]: event.target.value } );
	};

	getHeaderImage() {
		return (
			<div className="jetpack-connect__jetpack-logo">
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
			<span className="jetpack-connect__install-step">
				{ translate(
					'Add your WordPress administrator credentials ' +
						'for this site. Your credentials will not be stored and are used for the purpose ' +
						'of installing Jetpack securely. You can also skip this step entirely and install Jetpack manually.'
				) }
			</span>
		);
	}

	formFields() {
		return (
			<div>
				<FormLabel htmlFor="username">{ this.props.translate( 'Username' ) }</FormLabel>
				<div className="jetpack-connect__site-address-container">
					<Gridicon size={ 24 } icon="user" />
					<FormTextInput
						autoCapitalize="off"
						autoCorrect="off"
						className="jetpack-connect__credentials-form-input"
						disabled={ this.state.submitting }
						id="username"
						name="username"
						onChange={ this.getChangeHandler( 'username' ) }
						value={ this.state.username || '' }
					/>
				</div>

				<div className="jetpack-connect__password-container">
					<FormLabel htmlFor="password">{ this.props.translate( 'Password' ) }</FormLabel>
					<div className="jetpack-connect__password-form">
						<Gridicon size={ 24 } icon="lock" />
						<FormPasswordInput
							className="jetpack-connect__password-form-input"
							disabled={ this.state.submitting }
							id="password"
							name="password"
							onChange={ this.getChangeHandler( 'password' ) }
							value={ this.state.password || '' }
						/>
					</div>
				</div>
			</div>
		);
	}

	formFooter() {
		const { translate } = this.props;
		return (
			<FormButton
				className="jetpack-connect__credentials-submit"
				disabled={ ! this.state.username || ! this.state.password }
			>
				{ translate( 'Install Jetpack' ) }
			</FormButton>
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

	onClickBack() {
		page.redirect( '/jetpack/connect' );
	}

	footerLink() {
		const { translate } = this.props;
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href="https://jetpack.com/support/installing-jetpack/">
					{ translate( 'Install Jetpack manually' ) }
				</LoggedOutFormLinkItem>
				<HelpButton label={ 'Get help connecting your site' } />
				<div className="jetpack-connect__navigation">
					<Button
						compact
						borderless
						className="jetpack-connect__back-button"
						onClick={ this.onClickBack }
					>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ translate( 'Back' ) }
					</Button>
				</div>
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
				{ this.formHeader() }
				<div className="jetpack-connect__site-url-input-container">
					<LoggedOutForm onSubmit={ this.handleSubmit }>
						{ this.formFields() }
						{ this.formFooter() }
					</LoggedOutForm>
				</div>
				{ this.footerLink() }
			</MainWrapper>
		);
	}
}

export default connect(
	state => {
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
	{ jetpackRemoteInstall }
)( localize( OrgCredentialsForm ) );
