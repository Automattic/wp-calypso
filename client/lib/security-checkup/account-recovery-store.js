/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:lib:security-checkup:account-recovery-store' ),
	assign = require( 'lodash/assign' ),
	isEmpty = require( 'lodash/isEmpty' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	emitter = require( 'lib/mixins/emitter' ),
	actions = require( './constants' ).actions,
	messages = require( './constants' ).messages,
	me = require( 'lib/wp' ).undocumented().me();

var _initialized = false,
	_loading = false,
	_phone = {},
	_email = {};

var AccountRecoveryStore = {
	getEmail: function() {
		fetchFromAPIIfNotInitialized();

		return assign( {
			loading: _loading,
		}, _email );
	},

	getPhone: function() {
		fetchFromAPIIfNotInitialized();

		return assign( {
			loading: _loading,
		}, _phone );
	}
};

function emitChange() {
	AccountRecoveryStore.emit( 'change' );
}

// initialize blank data
resetData();

function resetData() {
	resetEmail();
	resetPhone();
}

function updatePhone( phone ) {
	_phone.data = assign( {}, phone );
}

function resetPhone() {
	updatePhone( null );
}

function updateEmail( email ) {
	_email.data = {
		email: email
	};
}

function resetEmail() {
	updateEmail( null );
}

function fetchFromAPIIfNotInitialized() {
	if ( _initialized ) {
		return;
	}

	_initialized = true;
	fetchFromAPI();
}

function fetchFromAPI() {
	if ( _loading ) {
		return;
	}

	_loading = true;
	me.getAccountRecovery( function( error, data ) {
		_loading = false;

		if ( error ) {
			handleError( error );
			return;
		}

		handleResponse( data );
	} );
}

function handleResponse( data ) {
	if ( data.phone ) {
		updatePhone( {
			countryCode: data.phone.country_code,
			countryNumericCode: data.phone.country_numeric_code,
			number: data.phone.number,
			numberFull: data.phone.number_full
		} );
	}

	if ( data.email ) {
		updateEmail( data.email );
	}

	emitChange();
}

function setPhoneNotice( message, type ) {
	_phone.lastNotice = {
		type: type,
		message: message
	};
}

function setEmailNotice( message, type ) {
	_email.lastNotice = {
		type: type,
		message: message
	};
}

function resetEmailNotice() {
	_email.lastNotice = false;
}

function resetPhoneNotice() {
	_phone.lastNotice = false;
}

function handleEmailError( error ) {
	setEmailNotice( error.message, 'error' );
	emitChange();
}

function handlePhoneError( error ) {
	setPhoneNotice( error.message, 'error' );
	emitChange();
}

function handleError( error ) {
	setPhoneNotice( error.message, 'error' );
	setEmailNotice( error.message, 'error' );
	emitChange();
}

AccountRecoveryStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;
	debug( 'action triggered', action.type, payload );

	switch ( action.type ) {
		case actions.UPDATE_ACCOUNT_RECOVERY_PHONE:
			updatePhone( action.phone );
			emitChange();
			break;

		case actions.RECEIVE_UPDATED_ACCOUNT_RECOVERY_PHONE:
			if ( action.error ) {
				handlePhoneError( action.error );
				break;
			}

			updatePhone( action.phone );
			if ( isEmpty( action.previousPhone ) ) {
				setPhoneNotice( messages.SMS_ADDED );
			} else {
				setPhoneNotice( messages.SMS_UPDATED );
			}

			emitChange();
			break;

		case actions.DELETE_ACCOUNT_RECOVERY_PHONE:
			resetPhone();
			emitChange();
			break;

		case actions.RECEIVE_DELETED_ACCOUNT_RECOVERY_PHONE:
			if ( action.error ) {
				handlePhoneError( action.error );
				break;
			}

			resetPhone();
			setPhoneNotice( messages.SMS_DELETED );
			emitChange();
			break;

		case actions.UPDATE_ACCOUNT_RECOVERY_EMAIL:
			updateEmail( action.email );
			emitChange();
			break;

		case actions.RECEIVE_UPDATED_ACCOUNT_RECOVERY_EMAIL:
			if ( action.error ) {
				handleEmailError( action.error );
				break;
			}

			updateEmail( action.email );
			if ( ! action.previousEmail ) {
				setEmailNotice( messages.EMAIL_ADDED );
			} else {
				setEmailNotice( messages.EMAIL_UPDATED );
			}

			emitChange();
			break;

		case actions.DELETE_ACCOUNT_RECOVERY_EMAIL:
			resetEmail();
			emitChange();
			break;

		case actions.RECEIVE_DELETED_ACCOUNT_RECOVERY_EMAIL:
			if ( action.error ) {
				handleEmailError( action.error );
				break;
			}

			resetEmail();
			setEmailNotice( messages.EMAIL_DELETED );
			emitChange();
			break;

		case actions.DISMISS_ACCOUNT_RECOVERY_EMAIL_NOTICE:
			resetEmailNotice();
			emitChange();
			break;

		case actions.DISMISS_ACCOUNT_RECOVERY_PHONE_NOTICE:
			resetPhoneNotice();
			emitChange();
			break;
	}
} );

emitter( AccountRecoveryStore );

module.exports = AccountRecoveryStore;
