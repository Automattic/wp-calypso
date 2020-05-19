/**
 * External dependencies
 */
import debugFactory from 'debug';
import { get as webauthn_auth } from '@github/webauthn-json';
import { replace } from 'lodash';

const debug = debugFactory( 'calypso:two-step-authorization' );

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'lib/analytics/tracks';
import { bumpStat } from 'lib/analytics/mc';
import config from 'config';
import emitter from 'lib/mixins/emitter';
import userSettings from 'lib/user-settings';
import { reduxDispatch } from 'lib/redux-bridge';
import { requestConnectedApplications } from 'state/connected-applications/actions';
import { requestUserProfileLinks } from 'state/profile-links/actions';
import wp from 'lib/wp';

const wpcom = wp.undocumented();

/*
 * Initialize TwoStepAuthorization with defaults
 */
function TwoStepAuthorization() {
	if ( ! ( this instanceof TwoStepAuthorization ) ) {
		return new TwoStepAuthorization();
	}

	this.data = {};
	this.initialized = false;
	this.smsResendThrottled = false;

	this.bumpMCStat = function ( eventAction ) {
		bumpStat( '2fa', eventAction );
		recordTracksEvent( 'calypso_login_twostep_authorize', {
			event_action: eventAction,
		} );
	};

	this.fetch();
}

/*
 * fetch data about users two step configuration from /me/two-step
 */
TwoStepAuthorization.prototype.fetch = function ( callback ) {
	wpcom.me().getTwoStep(
		function ( error, data ) {
			if ( ! error ) {
				this.data = data;

				if ( this.isReauthRequired() && ! this.initialized ) {
					this.bumpMCStat( 'reauth-required' );
				}

				this.initialized = true;
				this.emit( 'change' );
			}

			if ( callback ) {
				callback( error, data );
			}
		}.bind( this )
	);
};

TwoStepAuthorization.prototype.postLoginRequest = function ( endpoint, data ) {
	if ( ! this.getTwoStepWebauthnNonce() ) {
		return Promise.reject( 'Invalid nonce' );
	}

	const url = 'https://wordpress.com/wp-login.php?action=' + endpoint;
	const formData = new window.FormData();
	const requestData = {
		...data,
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
		auth_type: 'webauthn',
		two_step_nonce: this.getTwoStepWebauthnNonce(),
	};

	for ( const key in requestData ) {
		formData.set( key, requestData[ key ] );
	}

	return window
		.fetch( url, {
			method: 'POST',
			body: formData,
			credentials: 'include',
		} )
		.then( ( response ) => response.json() );
};

TwoStepAuthorization.prototype.refreshDataOnSuccessfulAuth = function () {
	// If the validation was successful AND re-auth was required, fetch
	// data from the following modules.
	if ( this.isReauthRequired() ) {
		userSettings.fetchSettings();
		reduxDispatch( requestConnectedApplications() );
		reduxDispatch( requestUserProfileLinks() );
	}
	this.data.two_step_reauthorization_required = false;
	this.data.two_step_authorization_expires_soon = false;
	this.invalidCode = false;

	this.emit( 'change' );
};

TwoStepAuthorization.prototype.loginUserWithSecurityKey = function ( args ) {
	return this.postLoginRequest( 'webauthn-challenge-endpoint', {
		user_id: args.user_id,
	} )
		.then( ( response ) => {
			const parameters = response.data || [];
			this.data.two_step_webauthn_nonce = parameters.two_step_nonce;
			if ( typeof this.data.two_step_webauthn_nonce === 'undefined' ) {
				return Promise.reject( response );
			}
			return webauthn_auth( { publicKey: parameters } );
		} )
		.then( ( assertion ) => {
			return this.postLoginRequest( 'webauthn-authentication-endpoint', {
				user_id: args.user_id,
				client_data: JSON.stringify( assertion ),
				create_2fa_cookies_only: 1,
			} );
		} )
		.then( ( response ) => {
			if ( typeof response.success === 'undefined' || ! response.success ) {
				return Promise.reject( response );
			}
			this.refreshDataOnSuccessfulAuth();
			return response;
		} );
};

/*
 * Given a code, validate the code which will update a user's twostep_auth cookie
 */
TwoStepAuthorization.prototype.validateCode = function ( args, callback ) {
	wpcom.me().validateTwoStepCode(
		{
			...args,
			code: replace( args.code, /\s/g, '' ),
		},
		function ( error, data ) {
			if ( ! error && data.success ) {
				if ( args.action ) {
					this.bumpMCStat(
						'enable-two-step' === args.action ? 'enable-2fa-successful' : 'disable-2fa-successful'
					);
				} else {
					this.bumpMCStat( 'reauth-successful' );
				}

				this.refreshDataOnSuccessfulAuth();
			} else if ( ! error ) {
				// If code was invalid but API did not error
				this.invalidCode = true;

				if ( args.action ) {
					this.bumpMCStat(
						'enable-two-step' === args.action
							? 'enable-2fa-failed-invalid-code'
							: 'disable-2fa-failed-invalid-code'
					);
				} else {
					this.bumpMCStat( 'reauth-failed-invalid-code' );
				}
			}

			if ( callback ) {
				callback( error, data );
			}
		}.bind( this )
	);
};

/*
 * Send an SMS authentication code to a user's SMS phone number by calling
 * /me/two-step/sms/new
 */
TwoStepAuthorization.prototype.sendSMSCode = function ( callback ) {
	wpcom.me().sendSMSValidationCode(
		function ( error, data ) {
			if ( error ) {
				debug( 'Sending SMS code failed: ' + JSON.stringify( error ) );

				if ( error.error && 'rate_limited' === error.error ) {
					debug( 'SMS resend throttled.' );
					this.bumpMCStat( 'sms-code-send-throttled' );
					this.smsResendThrottled = true;
				}
			} else {
				this.smsResendThrottled = false;
				this.bumpMCStat( 'sms-code-send-success' );
			}

			this.emit( 'change' );

			if ( callback ) {
				callback( error, data );
			}
		}.bind( this )
	);
};

/*
 * Fetches a new set of backup codes by calling /me/two-step/backup-codes/new
 */
TwoStepAuthorization.prototype.backupCodes = function ( callback ) {
	wpcom.me().backupCodes(
		function ( error, data ) {
			if ( error ) {
				debug( 'Fetching Backup Codes failed: ' + JSON.stringify( error ) );
			} else {
				this.bumpMCStat( 'new-backup-codes-success' );
			}

			if ( callback ) {
				callback( error, data );
			}
		}.bind( this )
	);
};

/*
 * Similar to validateCode, but without the change triggers across the
 * TwoStepAuthorization objects, so that the caller can delay state
 * transition until it is ready
 */
TwoStepAuthorization.prototype.validateBackupCode = function ( code, callback ) {
	const args = {
		code: replace( code, /\s/g, '' ),
		action: 'create-backup-receipt',
	};

	wpcom.me().validateTwoStepCode(
		args,
		function ( error, data ) {
			if ( error ) {
				debug( 'Validating Two Step Code failed: ' + JSON.stringify( error ) );
			}

			if ( data ) {
				this.bumpMCStat(
					data.success ? 'backup-code-validate-success' : 'backup-code-validate-failure'
				);
			}

			if ( callback ) {
				callback( error, data );
			}
		}.bind( this )
	);
};

/*
 * Requests the authentication app QR code URL and time code
 * from me/two-step/app-auth-setup
 */
TwoStepAuthorization.prototype.getAppAuthCodes = function ( callback ) {
	wpcom.me().getAppAuthCodes( function ( error, data ) {
		if ( error ) {
			debug( 'Getting App Auth Codes failed: ' + JSON.stringify( error ) );
		}

		if ( callback ) {
			callback( error, data );
		}
	} );
};

TwoStepAuthorization.prototype.codeValidationFailed = function () {
	return this.invalidCode;
};

TwoStepAuthorization.prototype.isSMSResendThrottled = function () {
	return this.smsResendThrottled;
};

TwoStepAuthorization.prototype.isReauthRequired = function () {
	return this.data.two_step_reauthorization_required ?? false;
};

TwoStepAuthorization.prototype.authExpiresSoon = function () {
	return this.data.two_step_authorization_expires_soon ?? false;
};

TwoStepAuthorization.prototype.isTwoStepSMSEnabled = function () {
	return this.data.two_step_sms_enabled ?? false;
};

TwoStepAuthorization.prototype.isSecurityKeyEnabled = function () {
	return this.data.two_step_webauthn_enabled ?? false;
};

TwoStepAuthorization.prototype.getTwoStepWebauthnNonce = function () {
	return this.data.two_step_webauthn_nonce ?? false;
};

TwoStepAuthorization.prototype.getSMSLastFour = function () {
	return this.data.two_step_sms_last_four ?? null;
};

emitter( TwoStepAuthorization.prototype );

/**
 * Expose TwoStepAuthorization
 */
export default new TwoStepAuthorization();
