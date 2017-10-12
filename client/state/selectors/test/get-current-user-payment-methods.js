/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getCurrentUserPaymentMethods } from '../';

describe( 'getCurrentUserPaymentMethods()', () => {
	const creditCardPaypal = [ 'credit-card', 'paypal' ],
		paypalCreditCard = [ 'paypal', 'credit-card' ];

	const enLangUsCountryState = {
		geo: {
			geo: {
				country_short: 'US',
			},
		},

		users: {
			items: {
				73705554: { ID: 73705554, login: 'testonesite2014', localeSlug: 'en' },
			},
		},

		currentUser: {
			id: 73705554,
		},
	};

	const deLangDeCountryState = {
		geo: {
			geo: {
				country_short: 'DE',
			},
		},

		users: {
			items: {
				73705554: { ID: 73705554, login: 'testonesite2014', localeSlug: 'de' },
			},
		},

		currentUser: {
			id: 73705554,
		},
	};

	const deLangJpCountryState = {
		geo: {
			geo: {
				country_short: 'JP',
			},
		},

		users: {
			items: {
				73705554: { ID: 73705554, login: 'testonesite2014', localeSlug: 'de' },
			},
		},

		currentUser: {
			id: 73705554,
		},
	};

	const frLangDeCountryState = {
		geo: {
			geo: {
				country_short: 'DE',
			},
		},

		users: {
			items: {
				73705554: { ID: 73705554, login: 'testonesite2014', localeSlug: 'fr' },
			},
		},

		currentUser: {
			id: 73705554,
		},
	};

	test( 'en-US should return credit card primary, PayPal secondary', () => {
		expect( getCurrentUserPaymentMethods( enLangUsCountryState ) ).to.eql( creditCardPaypal );
	} );

	test( 'en-DE should return PayPal primary, credit card secondary', () => {
		expect( getCurrentUserPaymentMethods( deLangDeCountryState ) ).to.eql( paypalCreditCard );
	} );

	test( 'de-DE should return PayPal primary, credit card secondary', () => {
		expect( getCurrentUserPaymentMethods( deLangDeCountryState ) ).to.eql( paypalCreditCard );
	} );

	test( 'de-JP should return credit card primary, PayPal secondary', () => {
		expect( getCurrentUserPaymentMethods( deLangJpCountryState ) ).to.eql( creditCardPaypal );
	} );

	test( 'fr-DE should return credit card primary, PayPal secondary', () => {
		expect( getCurrentUserPaymentMethods( frLangDeCountryState ) ).to.eql( creditCardPaypal );
	} );
} );
