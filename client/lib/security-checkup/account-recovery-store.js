/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:lib:security-checkup:account-recovery-store' ),
	assign = require( 'lodash/object/assign' ),
	isEmpty = require( 'lodash/lang/isEmpty' );

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
	_phone = {
		isSavingEmail: false,
		lastRequestStatus: {
			isSuccessfull: false,
			message: ''
		},
		data: {}
	},
	_emails = {
		isSavingEmail: false,
		lastRequestStatus: {
			isSuccessfull: false,
			message: ''
		},
		data: {}
	};

var AccountRecoveryStore = {
	isSavingRecoveryEmail: function() {
		return _emails.isSavingEmail;
	},

	isSavingRecoveryPhone: function() {
		return _phone.isSavingPhone;
	},

	getEmails: function() {
		fetchFromAPIIfNotInitialized();

		return assign( {
			loading: _loading
		}, _emails );
	},

	getPhone: function() {
		fetchFromAPIIfNotInitialized();

		return assign( {
			loading: _loading
		}, _phone );
	}
};

function emitChange() {
	AccountRecoveryStore.emit( 'change' );
}

function updatePhone( phone ) {
	_phone.data = assign( {}, phone );
}

function updateEmails( emails ) {
	_emails.data = emails
}

function removeEmail( email ) {
	_emails.data = {
		emails: _emails.data.remove( email )
	};
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

	if ( data.emails ) {
		updateEmails( data.emails );
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
	_emails.lastNotice = {
		type: type,
		message: message
	};
}

function resetEmailNotice() {
	_emails.lastNotice = false;
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
			emitChange();
			break;

		case actions.RECEIVE_DELETED_ACCOUNT_RECOVERY_PHONE:
			if ( action.error ) {
				break;
			}

			emitChange();
			break;

		case actions.UPDATE_ACCOUNT_RECOVERY_EMAIL:
			_emails.isSavingEmail = true;
			emitChange();
			break;

		case actions.RECEIVE_UPDATED_ACCOUNT_RECOVERY_EMAIL:
			_emails.isSavingEmail = false;
			if ( action.error ) {
				_emails.lastRequestStatus.isSuccessfull = false;
				_emails.lastRequestStatus.message = action.error;
				emitChange();
				break;
			}

			_emails.lastRequestStatus.isSuccessfull = false;
			_emails.lastRequestStatus.message = messages.EMAIL_ADDED;
			emitChange();
			break;

		case actions.DELETE_ACCOUNT_RECOVERY_EMAIL:
			removeEmail( action.email );
			emitChange();
			break;

		case actions.RECEIVE_DELETED_ACCOUNT_RECOVERY_EMAIL:
			if ( action.error ) {
				handleEmailError( action.error );
				break;
			}

			removeEmail( action.email );
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
