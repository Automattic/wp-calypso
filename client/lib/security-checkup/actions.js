/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	analytics = require( 'lib/analytics' ),
	actions = require( './constants' ).actions,
	me = require( 'lib/wp' ).undocumented().me();

var SecurityCheckupActions = {
	updatePhone: function( phone, previousPhone ) {
		var country = phone.countryCode,
			number = phone.number;

		Dispatcher.handleViewAction( {
			type: actions.UPDATE_ACCOUNT_RECOVERY_PHONE,
			phone,
			previousPhone
		} );

		me.updateAccountRecoveryPhone( country, number, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: actions.RECEIVE_UPDATED_ACCOUNT_RECOVERY_PHONE,
				phone,
				previousPhone,
				data,
				error
			} );

			let event = previousPhone ? 'edited' : 'added';
			recordEvent( `calypso_security_checkup_sms_${ event }`, error );
		} );
	},

	deletePhone: function() {
		Dispatcher.handleViewAction( {
			type: actions.DELETE_ACCOUNT_RECOVERY_PHONE
		} );

		me.deleteAccountRecoveryPhone( function( error, data ) {
			Dispatcher.handleServerAction( {
				type: actions.RECEIVE_DELETED_ACCOUNT_RECOVERY_PHONE,
				data: data,
				error: error
			} );

			recordEvent( `calypso_security_checkup_sms_deleted`, error );
		} );
	},

	resendPhoneValidationCode: function() {
		Dispatcher.handleViewAction( {
			type: actions.RESEND_ACCOUNT_RECOVERY_PHONE_VALIDATION_CODE,
		} );

		me.newAccountRecoveryPhoneValidationCode( function( error, data ) {
			Dispatcher.handleServerAction( {
				type: actions.RECEIVE_RESEND_ACCOUNT_RECOVERY_PHONE_VALIDATION_CODE,
				data: data,
				error: error,
			} );

			recordEvent( `calypso_security_checkup_phone_validation_code_new`, error );
		} );
	},

	validatePhone: function( code ) {
		Dispatcher.handleViewAction( {
			type: actions.VALIDATE_ACCOUNT_RECOVERY_PHONE,
		} );

		me.validateAccountRecoveryPhone( code, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: actions.RECEIVE_VALIDATE_ACCOUNT_RECOVERY_PHONE,
				data: data,
				error: error,
			} );

			recordEvent( `calypso_security_checkup_validate_phone`, error );
		} );
	},

	updateEmail: function( email, previousEmail ) {
		Dispatcher.handleViewAction( {
			type: actions.UPDATE_ACCOUNT_RECOVERY_EMAIL,
			email: email,
			previousEmail: previousEmail
		} );

		me.updateAccountRecoveryEmail( email, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: actions.RECEIVE_UPDATED_ACCOUNT_RECOVERY_EMAIL,
				previousEmail: previousEmail,
				email: email,
				data: data,
				error: error
			} );

			let event = previousEmail ? 'edited' : 'added';
			recordEvent( `calypso_security_checkup_email_${ event }`, error );
		} );
	},

	deleteEmail: function() {
		Dispatcher.handleViewAction( {
			type: actions.DELETE_ACCOUNT_RECOVERY_EMAIL
		} );

		me.deleteAccountRecoveryEmail( function( error, data ) {
			Dispatcher.handleServerAction( {
				type: actions.RECEIVE_DELETED_ACCOUNT_RECOVERY_EMAIL,
				data: data,
				error: error
			} );

			recordEvent( `calypso_security_checkup_email_deleted`, error );
		} );
	},

	resendEmailValidationCode: function() {
		Dispatcher.handleViewAction( {
			type: actions.RESEND_ACCOUNT_RECOVERY_EMAIL_VALIDATION_CODE,
		} );

		me.newAccountRecoveryEmailValidationCode( function( error, data ) {
			Dispatcher.handleServerAction( {
				type: actions.RECEIVE_RESEND_ACCOUNT_RECOVERY_EMAIL_VALIDATION_CODE,
				data: data,
				error: error,
			} );

			recordEvent( `calypso_security_checkup_email_validation_code_new`, error );
		} );
	},

	dismissEmailNotice: function() {
		Dispatcher.handleViewAction( {
			type: actions.DISMISS_ACCOUNT_RECOVERY_EMAIL_NOTICE
		} );
	},

	dismissPhoneNotice: function() {
		Dispatcher.handleViewAction( {
			type: actions.DISMISS_ACCOUNT_RECOVERY_PHONE_NOTICE
		} );
	}
};

function recordEvent( event, error ) {
	if ( error ) {
		analytics.tracks.recordEvent( event + '_error', {
			error
		} );
	} else {
		analytics.tracks.recordEvent( event );
	}
}

module.exports = SecurityCheckupActions;
