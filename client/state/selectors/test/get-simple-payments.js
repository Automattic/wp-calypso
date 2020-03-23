/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getSimplePayments from 'state/selectors/get-simple-payments';

const simplePayment1 = {
	ID: 1,
	title: 'Simple Payment 1',
	description: 'Simple Payment 1 description',
};

const simplePayment2 = {
	ID: 2,
	title: 'Simple Payment 2',
	description: 'Simple Payment 2 description',
};

const simplePayment3 = {
	ID: 3,
	title: 'Simple Payment 3',
	description: 'Simple Payment 3 description',
};

describe( 'getSimplePayments()', () => {
	test( 'should return null if siteId is not specified', () => {
		const state = {
			simplePayments: {
				productList: {
					items: {},
				},
			},
		};

		const simplePayments = getSimplePayments( state );

		expect( simplePayments ).to.eql( null );
	} );

	test( "should return null if siteId can't be found in Simple Payments", () => {
		const state = {
			simplePayments: {
				productList: {
					items: {
						1111: [],
					},
				},
			},
		};

		const simplePayments = getSimplePayments( state, 1234 );

		expect( simplePayments ).to.eql( null );
	} );

	test( 'should return empty array if there are no simple payments', () => {
		const state = {
			simplePayments: {
				productList: {
					items: {
						1234: [],
					},
				},
			},
		};

		const simplePayments = getSimplePayments( state, 1234 );

		expect( simplePayments ).to.eql( [] );
	} );

	test( 'should return all Simple Payments for a given siteId ordered by ID DESC', () => {
		const simplePaymentsInState = [ simplePayment2, simplePayment3, simplePayment1 ];

		const state = {
			simplePayments: {
				productList: {
					items: {
						1234: simplePaymentsInState,
					},
				},
			},
		};

		const simplePayments = getSimplePayments( state, 1234 );

		expect( simplePayments ).to.eql( [ simplePayment3, simplePayment2, simplePayment1 ] );
	} );

	test( 'should return null if simplePaymentId was specified but is not found', () => {
		const simplePaymentsInState = [ simplePayment1, simplePayment2 ];

		const state = {
			simplePayments: {
				productList: {
					items: {
						1234: simplePaymentsInState,
					},
				},
			},
		};

		const simplePayment = getSimplePayments( state, 1234, 10 );

		expect( simplePayment ).to.eql( null );
	} );

	test( 'should return a Simple Payment object if simplePaymentId is specified and found', () => {
		const simplePaymentsInState = [ simplePayment1, simplePayment2 ];

		const state = {
			simplePayments: {
				productList: {
					items: {
						1234: simplePaymentsInState,
					},
				},
			},
		};

		const simplePayment = getSimplePayments( state, 1234, 1 );

		expect( simplePayment ).to.eql( simplePayment1 );
	} );
} );
