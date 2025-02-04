import { FormLabel } from '@automattic/components';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormVerificationCodeInput from 'calypso/components/forms/form-verification-code-input';
import Notice from 'calypso/components/notice';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { bumpTwoStepAuthMCStat } from 'calypso/lib/two-step-authorization';
import wp from 'calypso/lib/wp';

import './style.scss';

const debug = debugFactory( 'calypso:me:security:2fa-backup-codes-prompt' );

class Security2faBackupCodesPrompt extends Component {
	static displayName = 'Security2faBackupCodesPrompt';

	static propTypes = {
		onPrintAgain: PropTypes.func,
		onSuccess: PropTypes.func.isRequired,
	};

	state = {
		backupCodeEntry: '',
		lastError: false,
		submittingCode: false,
	};

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	}

	onVerify = ( event ) => {
		event.preventDefault();
		this.setState( { submittingCode: true } );
		wp.req.post(
			'/me/two-step/validate',
			{
				code: this.state.backupCodeEntry.replace( /\s/g, '' ),
				action: 'create-backup-receipt',
			},
			( error, data ) => {
				if ( data ) {
					bumpTwoStepAuthMCStat(
						data.success ? 'backup-code-validate-success' : 'backup-code-validate-failure'
					);
				}

				this.setState( { submittingCode: false } );
				if ( error ) {
					this.setState( {
						lastError: this.props.translate(
							'Unable to validate codes right now. Please try again later.'
						),
					} );
					return;
				}

				if ( ! data.success ) {
					this.setState( {
						lastError: this.props.translate( 'You entered an invalid code. Please try again.' ),
					} );
					return;
				}

				this.props.onSuccess();
			}
		);
	};

	onPrintAgain = ( event ) => {
		event.preventDefault();
		this.props.onPrintAgain();
	};

	clearLastError = () => {
		this.setState( { lastError: false } );
	};

	onClickPrintButton = ( event ) => {
		gaRecordEvent( 'Me', 'Clicked On 2fa Print Backup Codes Again Button' );
		this.onPrintAgain( event );
	};

	possiblyRenderPrintAgainButton = () => {
		if ( ! this.props.onPrintAgain ) {
			return null;
		}

		return (
			<FormButton
				className="security-2fa-backup-codes-prompt__print"
				disabled={ this.state.submittingCode }
				isPrimary={ false }
				onClick={ this.onClickPrintButton }
				type="button"
			>
				{ this.props.translate( "Didn't Print The Codes?" ) }
			</FormButton>
		);
	};

	possiblyRenderError = () => {
		if ( ! this.state.lastError ) {
			return null;
		}

		return (
			<Notice
				status="is-error"
				onDismissClick={ this.clearLastError }
				text={ this.state.lastError }
			/>
		);
	};

	render() {
		return (
			<form className="security-2fa-backup-codes-prompt" onSubmit={ this.onVerify }>
				<FormFieldset>
					<FormLabel htmlFor="backup-code-entry">
						{ this.props.translate( 'Type a Backup Code to Verify' ) }
					</FormLabel>

					<FormVerificationCodeInput
						disabled={ this.state.submittingCode }
						name="backupCodeEntry"
						method="backup"
						onFocus={ function () {
							gaRecordEvent(
								'Me',
								'Focused On 2fa Backup Codes Confirm Printed Backup Codes Input'
							);
						} }
						value={ this.state.backupCodeEntry }
						onChange={ this.handleChange }
					/>
				</FormFieldset>

				{ this.possiblyRenderError() }

				{ this.possiblyRenderPrintAgainButton() }

				<FormButton
					className="security-2fa-backup-codes-prompt__verify"
					disabled={ this.state.submittingCode }
					onClick={ function () {
						gaRecordEvent( 'Me', 'Clicked On 2fa Backup Codes Verify Button' );
					} }
				>
					{ this.state.submittingCode
						? this.props.translate( 'Verifying…' )
						: this.props.translate( 'Verify' ) }
				</FormButton>
			</form>
		);
	}

	handleChange = ( e ) => {
		const { name, value } = e.currentTarget;
		this.setState( { [ name ]: value } );
	};
}

export default localize( Security2faBackupCodesPrompt );
