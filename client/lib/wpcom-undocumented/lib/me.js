/**
 * Module dependencies.
 */
import { Me } from 'wpcom';
import inherits from 'inherits';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:wpcom-undocumented:me' );

/**
 * Create an UndocumentedMe instance
 *
 * @param {WPCOM} wpcom - WPCOMUndocumented instance
 * @return {NUll} null
 */
function UndocumentedMe( wpcom ) {
	debug( 'UndocumentedMe' );
	if ( ! ( this instanceof UndocumentedMe ) ) {
		return new UndocumentedMe( wpcom );
	}
	this.wpcom = wpcom;
}

/**
 * Inherits from Me class
 */
inherits( UndocumentedMe, Me );

UndocumentedMe.prototype.billingHistoryEmailReceipt = function( receiptId, callback ) {
	var args = {
		path: '/me/billing-history/receipt/' + receiptId + '/email'
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.getReceipt = function( receiptId, fn ) {
	return this.wpcom.req.get( {
		path: `/me/billing-history/receipt/${ receiptId }`
	}, fn );
};

UndocumentedMe.prototype.purchases = function( callback ) {
	return this.wpcom.req.get( '/me/purchases', callback );
};

UndocumentedMe.prototype.getConnectedApplications = function( callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/connected-applications',
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.revokeApplicationConnection = function( connectionID, callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/connected-applications/' + connectionID + '/delete'
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.getApplicationPasswords = function( callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/two-step/application-passwords'
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.revokeApplicationPassword = function( passwordID, callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/two-step/application-passwords/' + passwordID + '/delete'
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.createApplicationPassword = function( applicationName, callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/two-step/application-passwords/new',
		body: {
			application_name: applicationName
		}
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.validatePassword = function( password, callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/settings/password/validate',
		body: {
			password: password
		}
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.sendSMSValidationCode = function( callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/two-step/sms/new'
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.validateTwoStepCode = function( body, callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/two-step/validate',
		body: body
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.getTwoStep = function( callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/two-step/'
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.getAppAuthCodes = function( callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/two-step/app-auth-setup/'
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.getTrophies = function( callback ) {
	var args = {
		path: '/me/trophies'
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.validateUsername = function( username, callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/username/validate/' + username
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.changeUsername = function( username, action, callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/username',
		body: {
			username: username,
			action: action
		}
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.storedCardDelete = function( card, callback ) {
	var args = {
		path: '/me/stored-cards/' + card.stored_details_id + '/delete',
	};
	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.backupCodes = function( callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/two-step/backup-codes/new'
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.blockSite = function( site, callback ) {
	var args = {
		path: '/me/block/sites/' + encodeURIComponent( site ) + '/new',
	};
	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.unblockSite = function( site, callback ) {
	var args = {
		path: '/me/block/sites/' + encodeURIComponent( site ) + '/delete',
	};
	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.devices = function( callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/notifications/devices/'
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.sendVerificationEmail = function( callback ) {
	debug( '/me/send-verification-email' );

	return this.wpcom.req.post( { path: '/me/send-verification-email' }, callback );
};

UndocumentedMe.prototype.getNotificationSettings = function( callback ) {
	debug( '/me/notification/settings/' );

	return this.wpcom.req.get( { apiVersion: '1.1', path: '/me/notifications/settings/' }, callback );
};

UndocumentedMe.prototype.updateNotificationSettings = function( settings, applyToAll, callback ) {
	var query = {};
	debug( '/me/notification/settings/' );

	if ( applyToAll ) {
		query = { applyToAll: true };
	}

	return this.wpcom.req.post( {
		apiVersion: '1.1',
		path: '/me/notifications/settings/',
	}, query, settings, callback );
};

UndocumentedMe.prototype.getAccountRecovery = function( callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/account-recovery'
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.updateAccountRecoveryPhone = function( country, phoneNumber, callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/account-recovery/phone',
		body: {
			country: country,
			phone_number: phoneNumber
		}
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.deleteAccountRecoveryPhone = function( callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/account-recovery/phone/delete'
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.updateAccountRecoveryEmail = function( email, callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/account-recovery/email',
		body: {
			email: email
		}
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.deleteAccountRecoveryEmail = function( callback ) {
	var args = {
		apiVersion: '1.1',
		path: '/me/account-recovery/email/delete'
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.deletePurchase = function( purchaseId, fn ) {
	debug( '/me/purchases/{purchaseId}/delete' );

	this.wpcom.req.post( {
		path: `/me/purchases/${purchaseId}/delete`
	}, fn );
};

module.exports = UndocumentedMe;
