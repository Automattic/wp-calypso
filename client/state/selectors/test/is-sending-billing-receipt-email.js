/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isSendingBillingReceiptEmail } from '../';

describe( 'isSendingBillingReceiptEmail()', () => {
	it( 'should return true if the receipt email is being sent for that receiptId', () => {
		const stateIn = {
			billingTransactions: {
				sendingReceiptEmail: {
					12345678: true,
				}
			}
		};
		const output = isSendingBillingReceiptEmail( stateIn, 12345678 );
		expect( output ).to.be.true;
	} );

	it( 'should return false if the receipt email is not being sent for that receiptId', () => {
		const stateIn = {
			billingTransactions: {
				sendingReceiptEmail: {
					12345678: false,
				}
			}
		};
		const output = isSendingBillingReceiptEmail( stateIn, 12345678 );
		expect( output ).to.be.false;
	} );

	it( 'should return null if receipt email for that receiptId is not known yet', () => {
		const stateIn = {
			billingTransactions: {
				sendingReceiptEmail: {
					88888888: false,
				}
			}
		};
		const output = isSendingBillingReceiptEmail( stateIn, 12345678 );
		expect( output ).to.be.null;
	} );
} );
