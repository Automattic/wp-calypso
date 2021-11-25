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

UndocumentedMe.prototype.sendVerificationEmail = function ( callback ) {
	debug( '/me/send-verification-email' );

	return this.wpcom.req.post( { path: '/me/send-verification-email' }, callback );
};

export default UndocumentedMe;
