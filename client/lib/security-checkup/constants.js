/**
 * External dependencies
 */
var keyMirror = require( 'key-mirror' ),
	i18n = require( 'i18n-calypso' );

var constants;

function _translateMessages() {
	return {
		EMAIL_ADDED: i18n.translate( 'Successfully added new recovery email address.' ),
		EMAIL_UPDATED: i18n.translate( 'Successfully updated recovery email address.' ),
		EMAIL_DELETED: i18n.translate( 'Successfully removed recovery email address.' ),
		SMS_ADDED: i18n.translate( 'Successfully added new recovery SMS number.' ),
		SMS_UPDATED: i18n.translate( 'Successfully updated recovery SMS number.' ),
		SMS_DELETED: i18n.translate( 'Successfully removed recovery SMS number.' )
	};
}

constants = {
	actions: keyMirror( {
		UPDATE_ACCOUNT_RECOVERY_PHONE: null,
		RECEIVE_UPDATED_ACCOUNT_RECOVERY_PHONE: null,
		DELETE_ACCOUNT_RECOVERY_PHONE: null,
		RECEIVE_DELETED_ACCOUNT_RECOVERY_PHONE: null,
		UPDATE_ACCOUNT_RECOVERY_EMAIL: null,
		RECEIVE_UPDATED_ACCOUNT_RECOVERY_EMAIL: null,
		DELETE_ACCOUNT_RECOVERY_EMAIL: null,
		RECEIVE_DELETED_ACCOUNT_RECOVERY_EMAIL: null,
		DISMISS_ACCOUNT_RECOVERY_PHONE_NOTICE: null,
		DISMISS_ACCOUNT_RECOVERY_EMAIL_NOTICE: null,
	} ),
	messages: _translateMessages()
};

i18n.on( 'change', function() {
	constants.messages = _translateMessages()
} );

module.exports = constants;
