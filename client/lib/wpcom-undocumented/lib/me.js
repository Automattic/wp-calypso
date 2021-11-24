import debugFactory from 'debug';
import inherits from 'inherits';
import WPCOM from 'wpcom';

const debug = debugFactory( 'calypso:wpcom-undocumented:me' );

/**
 * Create an UndocumentedMe instance
 *
 * @param {WPCOM} wpcom - WPCOMUndocumented instance
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
inherits( UndocumentedMe, WPCOM.Me );

UndocumentedMe.prototype.getReceipt = function ( receiptId, queryOrCallback ) {
	return this.wpcom.req.get(
		{
			path: `/me/billing-history/receipt/${ receiptId }`,
		},
		queryOrCallback
	);
};

UndocumentedMe.prototype.sendSMSValidationCode = function ( callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/two-step/sms/new',
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.validateTwoStepCode = function ( body, callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/two-step/validate',
		body: body,
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.getTwoStep = function ( callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/two-step/',
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.getAppAuthCodes = function ( callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/two-step/app-auth-setup/',
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.getPeerReferralLink = function ( callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/peer-referral-link',
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.setPeerReferralLinkEnable = function ( enable, callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/peer-referral-link-enable',
		body: {
			enable,
		},
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.sendVerificationEmail = function ( callback ) {
	debug( '/me/send-verification-email' );

	return this.wpcom.req.post( { path: '/me/send-verification-email' }, callback );
};

export default UndocumentedMe;
