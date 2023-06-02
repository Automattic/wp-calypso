import isSendingBillingReceiptEmail from 'calypso/state/selectors/is-sending-billing-receipt-email';

describe( 'isSendingBillingReceiptEmail()', () => {
	test( 'should return true if the receipt email is being sent for that receiptId', () => {
		const stateIn = {
			billingTransactions: {
				sendingReceiptEmail: {
					12345678: true,
				},
			},
		};
		const output = isSendingBillingReceiptEmail( stateIn, 12345678 );
		expect( output ).toBe( true );
	} );

	test( 'should return false if the receipt email is not being sent for that receiptId', () => {
		const stateIn = {
			billingTransactions: {
				sendingReceiptEmail: {
					12345678: false,
				},
			},
		};
		const output = isSendingBillingReceiptEmail( stateIn, 12345678 );
		expect( output ).toBe( false );
	} );

	test( 'should return null if receipt email for that receiptId is not known yet', () => {
		const stateIn = {
			billingTransactions: {
				sendingReceiptEmail: {
					88888888: false,
				},
			},
		};
		const output = isSendingBillingReceiptEmail( stateIn, 12345678 );
		expect( output ).toBeNull();
	} );
} );
