/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:me:security:2fa-backup-codes-prompt' );

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTelInput from 'components/forms/form-tel-input';
import twoStepAuthorization from 'lib/two-step-authorization';
import analytics from 'lib/analytics';
import constants from 'me/constants';
import Notice from 'components/notice';

class Security2faBackupCodesPrompt extends React.Component {
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

	getSubmitDisabled = () => {
		if ( this.state.submittingCode ) {
			return true;
		}

		if ( this.state.backupCodeEntry.length !== 8 ) {
			return true;
		}

		return false;
	};

	onVerify = event => {
		event.preventDefault();
		this.setState( { submittingCode: true } );
		twoStepAuthorization.validateBackupCode( this.state.backupCodeEntry, this.onRequestComplete );
	};

	onRequestComplete = ( error, data ) => {
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
	};

	onPrintAgain = event => {
		event.preventDefault();
		this.props.onPrintAgain();
	};

	clearLastError = () => {
		this.setState( { lastError: false } );
	};

	onClickPrintButton = event => {
		analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Print Backup Codes Again Button' );
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
					<FormTelInput
						disabled={ this.state.submittingCode }
						name="backupCodeEntry"
						autoComplete="off"
						maxLength="8"
						placeholder={ constants.eightDigitBackupCodePlaceholder }
						onFocus={ function() {
							analytics.ga.recordEvent(
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
					disabled={ this.getSubmitDisabled() }
					onClick={ function() {
						analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Backup Codes Verify Button' );
					} }
				>
					{ this.state.submittingCode
						? this.props.translate( 'Verifying…' )
						: this.props.translate( 'Verify' ) }
				</FormButton>
			</form>
		);
	}

	handleChange = e => {
		const { name, value } = e.currentTarget;
		this.setState( { [ name ]: value } );
	};
}

export default localize( Security2faBackupCodesPrompt );
