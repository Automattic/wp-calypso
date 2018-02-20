/** @format */
/**
 * Component which handle remote credentials for installing Jetpack
 */
import React, { Component } from 'react';
import { noop } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * External dependencies
 */
import CredentialsForm from 'components/credentials-form';
import FormattedHeader from 'components/formatted-header';
import HelpButton from './help-button';
import JetpackLogo from 'components/jetpack-logo';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import MainWrapper from './main-wrapper';
import { jetpackRemoteInstall } from 'state/jetpack-remote-install/actions';

export class OrgCredentialsForm extends Component {
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
					<CredentialsForm
						submitButtonText="Install Jetpack"
						footerLink={ this.footerLink() }
						actionOnSubmit={ this.props.jetpackRemoteInstall }
						installJetpack= { true }
					/>
				</div>
			</MainWrapper>
		);
	}
}

export default connect( null, { jetpackRemoteInstall } )( localize( OrgCredentialsForm ) );
