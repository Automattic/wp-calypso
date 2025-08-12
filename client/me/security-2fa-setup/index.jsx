import { Card, CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Security2faEnable from 'calypso/me/security-2fa-enable';
import Security2faInitialSetup from 'calypso/me/security-2fa-initial-setup';
import Security2faSetupBackupCodes from 'calypso/me/security-2fa-setup-backup-codes';
import Security2faSMSSettings from 'calypso/me/security-2fa-sms-settings';
import { successNotice } from 'calypso/state/notices/actions';

export const SMS_BASED_2FA_SETUP_ENTER_PHONE_STEP = 'sms-settings';
export const SMS_BASED_2FA_SETUP_VALIDATE_CODE_STEP = 'sms-based';
export const APP_BASED_2FA_VALIDATE_STEP = 'app-based';
export const DISPLAY_BACKUP_CODES_STEP = 'backup-codes';
export const INITIAL_SETUP_STEP = 'initial-setup';

class Security2faSetup extends Component {
	static propTypes = {
		onFinished: PropTypes.func.isRequired,
		translate: PropTypes.func,
	};

	state = {
		step: INITIAL_SETUP_STEP,
		authMethod: APP_BASED_2FA_VALIDATE_STEP,
	};

	onCancelSetup = ( event ) => {
		event.preventDefault();
		this.setState( { step: INITIAL_SETUP_STEP } );
	};

	onInitialSetupSuccess = ( event, authMethod ) => {
		this.setState( { step: authMethod, authMethod } );
	};

	onSetupSuccess = () => {
		this.setState( { step: DISPLAY_BACKUP_CODES_STEP } );
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
		this.setState( { step: APP_BASED_2FA_VALIDATE_STEP } );
	};

	onVerifyBySMS = () => {
		this.setState( { step: SMS_BASED_2FA_SETUP_VALIDATE_CODE_STEP } );
	};

	render() {
		const { step, authMethod } = this.state;
		const { translate } = this.props;

		const isSmsFlow = [
			SMS_BASED_2FA_SETUP_VALIDATE_CODE_STEP,
			SMS_BASED_2FA_SETUP_ENTER_PHONE_STEP,
		].includes( authMethod );

		if ( step === INITIAL_SETUP_STEP ) {
			return (
				<div className="security-2fa-setup__steps-container">
					<Security2faInitialSetup onSuccess={ this.onInitialSetupSuccess } />
				</div>
			);
		}

		let title = '';
		let content = null;

		switch ( step ) {
			case SMS_BASED_2FA_SETUP_ENTER_PHONE_STEP:
				title = translate( 'Enter phone number' );
				content = (
					<Security2faSMSSettings
						onCancel={ this.onCancelSetup }
						onVerifyByApp={ this.onVerifyByApp }
						onVerifyBySMS={ this.onVerifyBySMS }
					/>
				);
				break;

			case APP_BASED_2FA_VALIDATE_STEP:
				title = translate( 'Verify code' );
				content = (
					<Security2faEnable
						isSmsFlow={ false }
						onCancel={ this.onCancelSetup }
						onSuccess={ this.onSetupSuccess }
					/>
				);
				break;

			case SMS_BASED_2FA_SETUP_VALIDATE_CODE_STEP:
				title = translate( 'Verify code' );
				content = (
					<Security2faEnable
						isSmsFlow
						onCancel={ this.onCancelSetup }
						onSuccess={ this.onSetupSuccess }
					/>
				);
				break;

			case DISPLAY_BACKUP_CODES_STEP:
				title = translate( 'Generate backup codes' );
				content = (
					<Security2faSetupBackupCodes isSmsFlow={ isSmsFlow } onFinished={ this.onFinished } />
				);
				break;

			default:
				return null;
		}

		return (
			<>
				<CompactCard>{ title }</CompactCard>
				<Card>{ content }</Card>
			</>
		);
	}
}

export default connect( null, { successNotice } )( localize( Security2faSetup ) );
