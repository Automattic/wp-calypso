/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:security:2fa-backup-codes-prompt' );

/**
 * Internal dependencies
 */
var FormButton = require( 'components/forms/form-button' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	SimpleNotice = require( 'notices/simple-notice' ),
	twoStepAuthorization = require( 'lib/two-step-authorization' ),
	analytics = require( 'analytics' );

module.exports = React.createClass( {

	displayName: 'Security2faBackupCodesPrompt',

	mixins: [ React.addons.LinkedStateMixin ],

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

	possiblyRenderPrintAgainButton: function() {
		if ( ! this.props.onPrintAgain ) {
			return null;
		}

		return (
			<FormButton
				className="security-2fa-backup-codes-prompt__print"
				disabled={ this.state.submittingCode }
				isPrimary={ false }
				onClick={ function( event ) {
					analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Print Backup Codes Again Button' );
					this.onPrintAgain( event );
				}.bind( this ) }
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
			<SimpleNotice
				isCompact
				status="is-error"
				onClick={ this.clearLastError }
				text={ this.state.lastError }
			/>
		);
	},

	render: function() {
		return (
			<form className="security-2fa-backup-codes-prompt" onSubmit={ this.onVerify }>
				<FormFieldset>
					<FormLabel htmlFor="backup-code-entry">{ this.translate( 'Type a Backup Code' ) }</FormLabel>
					<FormTextInput
						disabled={ this.state.submittingCode }
						name="backup-code-entry"
						type="text"
						autoComplete="off"
						placeholder="12345678"
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
