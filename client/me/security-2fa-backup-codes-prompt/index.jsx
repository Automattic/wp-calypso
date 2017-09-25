/**
 * External dependencies
 */
import React from 'react';

import LinkedStateMixin from 'react-addons-linked-state-mixin';
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

export default React.createClass( {

	displayName: 'Security2faBackupCodesPrompt',

	mixins: [ LinkedStateMixin ],

	propTypes: {
		onPrintAgain: React.PropTypes.func,
		onSuccess: React.PropTypes.func.isRequired
	},

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	},

	getInitialState: function() {
		return {
			backupCodeEntry: '',
			lastError: false,
			submittingCode: false
		};
	},

	getSubmitDisabled: function() {
		if ( this.state.submittingCode ) {
			return true;
		}

		if ( this.state.backupCodeEntry.length !== 8 ) {
			return true;
		}

		return false;
	},

	onVerify: function( event ) {
		event.preventDefault();
		this.setState( { submittingCode: true } );
		twoStepAuthorization.validateBackupCode( this.state.backupCodeEntry, this.onRequestComplete );
	},

	onRequestComplete: function( error, data ) {
		this.setState( { submittingCode: false } );
		if ( error ) {
			this.setState( { lastError: this.translate( 'Unable to validate codes right now. Please try again later.' ) } );
			return;
		}

		if ( ! data.success ) {
			this.setState( { lastError: this.translate( 'You entered an invalid code. Please try again.' ), } );
			return;
		}

		this.props.onSuccess();
	},

	onPrintAgain: function( event ) {
		event.preventDefault();
		this.props.onPrintAgain();
	},

	clearLastError: function() {
		this.setState( { lastError: false } );
	},

	onClickPrintButton: function( event ) {
		analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Print Backup Codes Again Button' );
		this.onPrintAgain( event );
	},

	possiblyRenderPrintAgainButton: function() {
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
				{ this.translate( "Didn't Print The Codes?" ) }
			</FormButton>
		);
	},

	possiblyRenderError: function() {
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
	},

	render: function() {
		return (
			<form className="security-2fa-backup-codes-prompt" onSubmit={ this.onVerify }>
				<FormFieldset>
					<FormLabel htmlFor="backup-code-entry">{ this.translate( 'Type a Backup Code to Verify' ) }</FormLabel>
					<FormTelInput
						disabled={ this.state.submittingCode }
						name="backup-code-entry"
						autoComplete="off"
						maxLength="8"
						placeholder={ constants.eightDigitBackupCodePlaceholder }
						valueLink={ this.linkState( 'backupCodeEntry' ) }
						onFocus={ function() {
							analytics.ga.recordEvent( 'Me', 'Focused On 2fa Backup Codes Confirm Printed Backup Codes Input' );
						} }
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
					{ this.state.submittingCode ? this.translate( 'Verifying…' ) : this.translate( 'Verify' ) }
				</FormButton>
			</form>
		);
	}
} );
