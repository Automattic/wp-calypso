/**
 * External dependencies
 */
const React = require( 'react' ),
	ReactDom = require( 'react-dom' ),
	Clipboard = require( 'clipboard' ),
	userFactory = require( 'lib/user' ),
	Gridicon = require( 'gridicons' ),
	debug = require( 'debug' )( 'calypso:me:security:2fa-backup-codes-list' );

import { saveAs } from 'browser-filesaver';
/**
 * Internal dependencies
 */
const FormButton = require( 'components/forms/form-button' ),
	analytics = require( 'lib/analytics' ),
	FormButtonBar = require( 'components/forms/form-buttons-bar' ),
	FormCheckbox = require( 'components/forms/form-checkbox' ),
	FormLabel = require( 'components/forms/form-label' ),
	config = require( 'config' ),
	Notice = require( 'components/notice' ),
	ButtonGroup = require( 'components/button-group' ),
	Button = require( 'components/button' ),
	Tooltip = require( 'components/tooltip' );

module.exports = React.createClass( {

	displayName: 'Security2faBackupCodesList',

	popup: false,

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );

		// Configure clipboard to be triggered on clipboard button press
		const button = ReactDom.findDOMNode( this.refs.copyCodesBtn );
		this.clipboard = new Clipboard( button, {
			text: () => this.getBackupCodePlainText( this.props.backupCodes )
		} );
		this.clipboard.on( 'success', this.onCopy );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );

		// Cleanup clipboard object
		this.clipboard.destroy();
		delete this.clipboard;
	},

	getDefaultProps: function() {
		return {
			backupCodes: []
		};
	},

	propTypes: {
		onNextStep: React.PropTypes.func.isRequired
	},

	getInitialState: function() {
		return {
			userAgrees: false,
			printCodesTooltip: false,
			downloadCodesTooltip: false,
			copyCodesTooltip: false
		};
	},

	openPopup: function() {
		this.popup = window.open();

		if ( null === this.popup ) {
			this.setState(
				{
					lastError: this.translate( 'Please disable your pop-up blocker and try again.' )
				}
			);
			return false;
		}

		this.setState( { lastError: false } );
		return true;
	},

	onPrint: function() {
		analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Print Backup Codes Button' );

		if ( config.isEnabled( 'desktop' ) ) {
			require( 'lib/desktop' ).print(
				this.translate( 'Backup verification codes' ),
				this.getBackupCodeHTML( this.props.backupCodes )
			);
		} else if ( this.openPopup() ) {
			this.doPopup( this.props.backupCodes );
		}
	},

	onCopy: function() {
		analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Copy to clipboard Button' );
		this.setState( { isCopied: true } );
	},

	saveCodesToFile: function() {
		analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Save Backup Codes Button' );
		const user = userFactory();
		const username = user.get().username;

		const backupCodes = this.props.backupCodes.join( '\n' );
		const toSave = new Blob( [ backupCodes ], { type: 'text/plain;charset=utf-8' } );
		saveAs( toSave, `${username}-backup-codes.txt` );
	},

	getBackupCodePlainText: function( backupCodes ) {
		if ( backupCodes.length > 0 ) {
			return backupCodes.join( '\n' );
		}
	},

	enableDownloadCodesTooltip() {
		this.setState( { downloadCodesTooltip: true } );
	},

	disableDownloadCodesTooltip() {
		this.setState( { downloadCodesTooltip: false } );
	},

	enablePrintCodesTooltip() {
		this.setState( { printCodesTooltip: true } );
	},

	disablePrintCodesTooltip() {
		this.setState( { printCodesTooltip: false } );
	},

	enableCopyCodesTooltip() {
		this.setState( { copyCodesTooltip: true } );
	},

	disableCopyCodesTooltip() {
		this.setState( { copyCodesTooltip: false } );
	},

	getBackupCodeHTML: function( codes ) {
		const datePrinted = this.moment().format( 'MMM DD, YYYY @ h:mm a' );
		let row;
		let html = '<html><head><title>';

		html += this.translate( 'Backup verification codes' );
		html += '</title></head>';
		html += '<body style="font-family:sans-serif">';

		html += '<div style="padding:10px; border:1px dashed black; display:inline-block">';
		html += (
			'<p style="margin-top:0"><strong>' +
			this.translate( 'Backup verification codes' ) +
			'</strong></p>'
		);

		html += '<table style="border-spacing:30px 5px">';
		html += '<tbody>';

		for ( row = 0; row < 5; row++ ) {
			html += (
				'<tr>' +
				'<td>' + ( row + 1 ) + '. ' +
				'<strong>' + codes[ row * 2 ] + '</strong>' +
				'</td>' +
				'<td>' + ( row + 6 ) + '. ' +
				'<strong>' + codes[ row * 2 + 1 ] + '</strong>' +
				'</td>' +
				'</tr>'
			);
		}

		html += '</tbody></table>';

		html += (
			'<p style="margin-bottom:0">' +
			this.translate(
				'Printed: %(datePrinted)s',
				{
					args: {
						datePrinted: datePrinted
					}
				}
			) +
			'</p>'
		);

		html += '</div></body></html>';
		return html;
	},

	doPopup: function( codes ) {
		this.popup.document.open( 'text/html' );
		this.popup.document.write( this.getBackupCodeHTML( codes ) );
		this.popup.document.close();
		this.popup.print();

		/* this code takes advantage of setTimeout not running until after the
		print dialog is dismissed - it is more reliable than using focus tricks */
		setTimeout( function() {
			this.popup.close();
			this.popup = false;
		}.bind( this ), 100 );
	},

	onNextStep: function( event ) {
		event.preventDefault();
		this.props.onNextStep();
	},

	getPlaceholders: function() {
		let i;
		const placeholders = [];

		for ( i = 0; i < 10; i++ ) {
			placeholders.push( ' ' );
		}

		return placeholders;
	},

	onUserAgreesChange: function( event ) {
		this.setState( { userAgrees: event.target.checked } );
	},

	getSubmitDisabled: function() {
		return ! this.state.userAgrees;
	},

	renderList: function() {
		const backupCodes = this.props.backupCodes.length
							? this.props.backupCodes
							: this.getPlaceholders();

		return (
			<div>
				<p>
					{
						this.translate(
							'We ask that you print this list of ten unique, ' +
							'one-time-use backup codes and keep the list in a safe place.'
						)
					}
				</p>
				<ol className="security-2fa-backup-codes-list__codes">
					{ backupCodes.map( function( backupCode, index ) {
						let spacedCode = backupCode.concat( ' ' );
						// we add a space to each backup code so that if the user wants to copy and paste the entire list
						// the backup codes aren't placed in the clipboard as a single long number
						return (
							<li key={ index } className={ this.props.backupCodes.length ? null : 'is-placeholder' } >
								<span>
									{ spacedCode }
								</span>
							</li>
						);
					}, this ) }
				</ol>

				<p className="security-2fa-backup-codes-list__warning">
					<span className="noticon noticon-warning"></span>
					{ this.translate( 'Without access to the app, your phone, or a backup code, you will lose access to your account.' ) }
				</p>

				{ this.possiblyRenderError() }

				<FormButtonBar>
					<FormLabel className="security-2fa-backup-codes-list__print-agreement">
						<FormCheckbox
							defaultChecked={ this.state.userAgrees }
							onChange={ this.onUserAgreesChange }
						/>
						<span>
							{
								this.translate( 'I have printed or saved these codes',
								{ context: 'The codes are the backup codes for Two-Step Authentication.' } )
							}
						</span>
					</FormLabel>

					<FormButton
						className="security-2fa-backup-codes-list__next"
						onClick={ function( event ) {
							analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Backup Codes Next Step Button' );
							this.onNextStep( event );
						}.bind( this ) }
						disabled={ this.getSubmitDisabled() }
					>
						{
							this.translate( 'All Finished!',
							{ context: 'The user presses the All Finished button at the end of Two-Step setup.' } )
						}
					</FormButton>
					<ButtonGroup className="security-2fa-backup-codes-list__btn-group">
						<Button
							className="security-2fa-backup-codes-list__copy"
							disabled={ ! this.props.backupCodes.length }
							onMouseEnter={ this.enableCopyCodesTooltip }
							onMouseLeave={ this.disableCopyCodesTooltip }
							ref="copyCodesBtn"
						>
							<Gridicon icon="clipboard" />
							<Tooltip
								context={ this.refs && this.refs.copyCodesBtn }
								isVisible={ this.state.copyCodesTooltip }
								position="top"
							>
								{ this.translate( 'Copy Codes' ) }
							</Tooltip>
						</Button>

						<Button className="security-2fa-backup-codes-list__print"
							disabled={ ! this.props.backupCodes.length }
							onClick={ this.onPrint }
							onMouseEnter={ this.enablePrintCodesTooltip }
							onMouseLeave={ this.disablePrintCodesTooltip }
							ref="printCodesBtn"
						>
							<Gridicon icon="print" />
							<Tooltip
								context={ this.refs && this.refs.printCodesBtn }
								isVisible={ this.state.printCodesTooltip }
								position="top"
							>
								{ this.translate( 'Print Codes' ) }
							</Tooltip>
						</Button>

						<Button className="security-2fa-backup-codes-list__download"
							disabled={ ! this.props.backupCodes.length }
							onClick={ this.saveCodesToFile }
							onMouseEnter={ this.enableDownloadCodesTooltip }
							onMouseLeave={ this.disableDownloadCodesTooltip }
							ref="downloadCodesBtn"
						>
							<Gridicon icon="cloud-download" />
							<Tooltip
								context={ this.refs && this.refs.downloadCodesBtn }
								isVisible={ this.state.downloadCodesTooltip }
								position="top"
							>
								{ this.translate( 'Download Codes' ) }
							</Tooltip>
						</Button>
					</ButtonGroup>
				</FormButtonBar>
			</div>
		);
	},

	clearLastError: function() {
		this.setState( { lastError: false } );
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
			<div className="security-2fa-backup-codes-list">
				{ this.renderList() }
			</div>
		);
	}
} );
