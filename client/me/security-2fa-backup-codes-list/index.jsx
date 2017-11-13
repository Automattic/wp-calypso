/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import ReactDom from 'react-dom';
import Clipboard from 'clipboard';
import userFactory from 'lib/user';
import Gridicon from 'gridicons';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:me:security:2fa-backup-codes-list' );

import { saveAs } from 'browser-filesaver';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import analytics from 'lib/analytics';
import FormButtonBar from 'components/forms/form-buttons-bar';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import config from 'config';
import Notice from 'components/notice';
import ButtonGroup from 'components/button-group';
import Button from 'components/button';
import Tooltip from 'components/tooltip';

class Security2faBackupCodesList extends React.Component {
	static displayName = 'Security2faBackupCodesList';

	static defaultProps = {
		backupCodes: [],
	};

	static propTypes = {
		onNextStep: PropTypes.func.isRequired,
	};

	state = {
		userAgrees: false,
		printCodesTooltip: false,
		downloadCodesTooltip: false,
		copyCodesTooltip: false,
	};

	popup = false;

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );

		// Configure clipboard to be triggered on clipboard button press
		const button = ReactDom.findDOMNode( this.refs.copyCodesBtn );
		this.clipboard = new Clipboard( button, {
			text: () => this.getBackupCodePlainText( this.props.backupCodes ),
		} );
		this.clipboard.on( 'success', this.onCopy );
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component will unmount.' );

		// Cleanup clipboard object
		this.clipboard.destroy();
		delete this.clipboard;
	}

	openPopup = () => {
		this.popup = window.open();

		if ( null === this.popup ) {
			this.setState( {
				lastError: this.props.translate( 'Please disable your pop-up blocker and try again.' ),
			} );
			return false;
		}

		this.setState( { lastError: false } );
		return true;
	};

	onPrint = () => {
		analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Print Backup Codes Button' );

		if ( config.isEnabled( 'desktop' ) ) {
			require( 'lib/desktop' ).print(
				this.props.translate( 'Backup verification codes' ),
				this.getBackupCodeHTML( this.props.backupCodes )
			);
		} else if ( this.openPopup() ) {
			this.doPopup( this.props.backupCodes );
		}
	};

	onCopy = () => {
		analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Copy to clipboard Button' );
		this.setState( { isCopied: true } );
	};

	saveCodesToFile = () => {
		analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Save Backup Codes Button' );
		const user = userFactory();
		const username = user.get().username;

		const backupCodes = this.props.backupCodes.join( '\n' );
		const toSave = new Blob( [ backupCodes ], { type: 'text/plain;charset=utf-8' } );
		saveAs( toSave, `${ username }-backup-codes.txt` );
	};

	getBackupCodePlainText = backupCodes => {
		if ( backupCodes.length > 0 ) {
			return backupCodes.join( '\n' );
		}
	};

	enableDownloadCodesTooltip = () => {
		this.setState( { downloadCodesTooltip: true } );
	};

	disableDownloadCodesTooltip = () => {
		this.setState( { downloadCodesTooltip: false } );
	};

	enablePrintCodesTooltip = () => {
		this.setState( { printCodesTooltip: true } );
	};

	disablePrintCodesTooltip = () => {
		this.setState( { printCodesTooltip: false } );
	};

	enableCopyCodesTooltip = () => {
		this.setState( { copyCodesTooltip: true } );
	};

	disableCopyCodesTooltip = () => {
		this.setState( { copyCodesTooltip: false } );
	};

	getBackupCodeHTML = codes => {
		const datePrinted = this.props.moment().format( 'MMM DD, YYYY @ h:mm a' );
		let row;
		let html = '<html><head><title>';

		html += this.props.translate( 'Backup verification codes' );
		html += '</title></head>';
		html += '<body style="font-family:sans-serif">';

		html += '<div style="padding:10px; border:1px dashed black; display:inline-block">';
		html +=
			'<p style="margin-top:0"><strong>' +
			this.props.translate( 'Backup verification codes' ) +
			'</strong></p>';

		html += '<table style="border-spacing:30px 5px">';
		html += '<tbody>';

		for ( row = 0; row < 5; row++ ) {
			html +=
				'<tr>' +
				'<td>' +
				( row + 1 ) +
				'. ' +
				'<strong>' +
				codes[ row * 2 ] +
				'</strong>' +
				'</td>' +
				'<td>' +
				( row + 6 ) +
				'. ' +
				'<strong>' +
				codes[ row * 2 + 1 ] +
				'</strong>' +
				'</td>' +
				'</tr>';
		}

		html += '</tbody></table>';

		html +=
			'<p style="margin-bottom:0">' +
			this.props.translate( 'Printed: %(datePrinted)s', {
				args: {
					datePrinted: datePrinted,
				},
			} ) +
			'</p>';

		html += '</div></body></html>';
		return html;
	};

	doPopup = codes => {
		this.popup.document.open( 'text/html' );
		this.popup.document.write( this.getBackupCodeHTML( codes ) );
		this.popup.document.close();
		this.popup.print();

		/* this code takes advantage of setTimeout not running until after the
	print dialog is dismissed - it is more reliable than using focus tricks */
		setTimeout(
			function() {
				this.popup.close();
				this.popup = false;
			}.bind( this ),
			100
		);
	};

	onNextStep = event => {
		event.preventDefault();
		this.props.onNextStep();
	};

	getPlaceholders = () => {
		let i;
		const placeholders = [];

		for ( i = 0; i < 10; i++ ) {
			placeholders.push( ' ' );
		}

		return placeholders;
	};

	onUserAgreesChange = event => {
		this.setState( { userAgrees: event.target.checked } );
	};

	getSubmitDisabled = () => {
		return ! this.state.userAgrees;
	};

	renderList = () => {
		const backupCodes = this.props.backupCodes.length
			? this.props.backupCodes
			: this.getPlaceholders();

		return (
			<div>
				<p>
					{ this.props.translate(
						'We ask that you print this list of ten unique, ' +
							'one-time-use backup codes and keep the list in a safe place.'
					) }
				</p>
				<ol className="security-2fa-backup-codes-list__codes">
					{ backupCodes.map( function( backupCode, index ) {
						let spacedCode = backupCode.concat( ' ' );
						// we add a space to each backup code so that if the user wants to copy and paste the entire list
						// the backup codes aren't placed in the clipboard as a single long number
						return (
							<li
								key={ index }
								className={ this.props.backupCodes.length ? null : 'is-placeholder' }
							>
								<span>{ spacedCode }</span>
							</li>
						);
					}, this ) }
				</ol>

				<p className="security-2fa-backup-codes-list__warning">
					<Gridicon icon="notice" />
					{ this.props.translate(
						'Without access to the app, your phone, or a backup code, you will lose access to your account.'
					) }
				</p>

				{ this.possiblyRenderError() }

				<FormButtonBar>
					<FormLabel className="security-2fa-backup-codes-list__print-agreement">
						<FormCheckbox
							defaultChecked={ this.state.userAgrees }
							onChange={ this.onUserAgreesChange }
						/>
						<span>
							{ this.props.translate( 'I have printed or saved these codes', {
								context: 'The codes are the backup codes for Two-Step Authentication.',
							} ) }
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
						{ this.props.translate( 'All Finished!', {
							context: 'The user presses the All Finished button at the end of Two-Step setup.',
						} ) }
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
								{ this.props.translate( 'Copy Codes' ) }
							</Tooltip>
						</Button>

						<Button
							className="security-2fa-backup-codes-list__print"
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
								{ this.props.translate( 'Print Codes' ) }
							</Tooltip>
						</Button>

						<Button
							className="security-2fa-backup-codes-list__download"
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
								{ this.props.translate( 'Download Codes' ) }
							</Tooltip>
						</Button>
					</ButtonGroup>
				</FormButtonBar>
			</div>
		);
	};

	clearLastError = () => {
		this.setState( { lastError: false } );
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
		return <div className="security-2fa-backup-codes-list">{ this.renderList() }</div>;
	}
}

export default localize( Security2faBackupCodesList );
