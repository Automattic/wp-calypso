/**
 * External Dependencies
 */
const { app, dialog } = require( 'electron' );
const { EventEmitter } = require( 'events' );

/**
 * Internal dependencies
 */
const platform = require( 'desktop/lib/platform' );
const config = require( 'desktop/lib/config' );
const log = require( 'desktop/lib/logger' )( 'desktop:updater' );

class Updater extends EventEmitter {
	constructor( options ) {
		super();

		this.confirmLabel = options.confirmLabel || 'Update & Restart';
		this.dialogTitle =
		options.dialogTitle || 'A new version of {name} is available!';
		this.dialogMessage =
		options.dialogMessage ||
		'{name} {newVersion} is now available — you have {currentVersion}. Would you like to update now?';
		this.beta = options.beta || false;

		this._version = '';
		this._hasPrompted = false;
	}

	ping() {}

	onDownloaded( info ) {
		log.info( 'Update downloaded: ', info );
	}

	onAvailable( info ) {
		log.info( 'Update is available', info );
	}

	onNotAvailable( info ) {
		log.info( 'Update is not available', info );
	}

	onError( event ) {
		log.error( 'Update failed: ', event );
	}

	onConfirm() {}

	onCancel() {}

	notify() {
		const updateDialogOptions = {
			buttons: [ this.sanitizeButtonLabel( this.confirmLabel ), 'Cancel' ],
			title: 'Update Available',
			message: this.expandMacros( this.dialogTitle ),
			detail: this.expandMacros( this.dialogMessage ),
		};

		if ( !this._hasPrompted ) {
			this._hasPrompted = true;

			dialog.showMessageBox( updateDialogOptions, button => {
				this._hasPrompted = false;

				if ( button === 0 ) {
					// Confirm
					this.onConfirm();
				} else {
					this.onCancel();
				}

				this.emit( 'end' );
			} );
		}
	}

	setVersion( version ) {
		this._version = version;
	}

	expandMacros( originalText ) {
		const macros = {
			name: config.appName,
			currentVersion: app.getVersion(),
			newVersion: this._version,
		};

		let text = originalText;

		for ( const key in macros ) {
			if ( macros.hasOwnProperty( key ) ) {
				text = text.replace( new RegExp( `{${key}}`, 'ig' ), macros[key] );
			}
		}

		return text;
	}

	sanitizeButtonLabel( value ) {
		if ( platform.isWindows() ) {
			return value.replace( '&', '&&' );
		}

		return value;
	}
}

module.exports = Updater;
