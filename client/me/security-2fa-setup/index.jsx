import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Security2faEnable from 'calypso/me/security-2fa-enable';
import Security2faInitialSetup from 'calypso/me/security-2fa-initial-setup';
import Security2faSetupBackupCodes from 'calypso/me/security-2fa-setup-backup-codes';
import Security2faSMSSettings from 'calypso/me/security-2fa-sms-settings';
import { successNotice } from 'calypso/state/notices/actions';

class Security2faSetup extends Component {
	static propTypes = {
		onFinished: PropTypes.func.isRequired,
		translate: PropTypes.func,
	};

	state = {
		step: 'initial-setup',
		authMethod: 'app-based',
		backupCodes: [],
	};

	onCancelSetup = ( event ) => {
		event.preventDefault();
		this.setState( { step: 'initial-setup' } );
	};

	onInitialSetupSuccess = ( event, authMethod ) => {
		this.setState( { step: authMethod, authMethod } );
	};

	onSetupSuccess = ( backupCodes ) => {
		this.setState( { step: 'backup-codes', backupCodes } );
	};

	onFinished = () => {
		this.props.successNotice(
			this.props.translate( 'Successfully enabled Two-Step Authentication.' ),
			{
				duration: 4000,
			}
		);
		this.props.onFinished();
	};

	onVerifyByApp = () => {
		this.setState( { step: 'app-based' } );
	};

	onVerifyBySMS = () => {
		this.setState( { step: 'sms-based' } );
	};

	render() {
		const isSmsFlow = [ 'sms-based', 'sms-settings' ].includes( this.state.authMethod );
		return (
			<div className="security-2fa-setup__steps-container">
				{ 'initial-setup' === this.state.step ? (
					<Security2faInitialSetup onSuccess={ this.onInitialSetupSuccess } />
				) : null }

				{ 'sms-settings' === this.state.step ? (
					<Security2faSMSSettings
						onCancel={ this.onCancelSetup }
						onVerifyByApp={ this.onVerifyByApp }
						onVerifyBySMS={ this.onVerifyBySMS }
					/>
				) : null }

				{ 'app-based' === this.state.step ? (
					<Security2faEnable
						isSmsFlow={ false }
						onCancel={ this.onCancelSetup }
						onSuccess={ this.onSetupSuccess }
					/>
				) : null }

				{ 'sms-based' === this.state.step ? (
					<Security2faEnable
						isSmsFlow
						onCancel={ this.onCancelSetup }
						onSuccess={ this.onSetupSuccess }
					/>
				) : null }

				{ 'backup-codes' === this.state.step ? (
					<Security2faSetupBackupCodes
						backupCodes={ this.state.backupCodes }
						isSmsFlow={ isSmsFlow }
						onFinished={ this.onFinished }
					/>
				) : null }
			</div>
		);
	}
}

export default connect( null, { successNotice } )( localize( Security2faSetup ) );
