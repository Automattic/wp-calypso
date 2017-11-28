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

	const enLangDeCountryState = {
		geo: {
			geo: {
				country_short: 'DE',
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

	const nlCountryState = {
		geo: {
			geo: {
				country_short: 'NL',
			},
		},

		users: {
			items: {
				73705554: { ID: 73705554, login: 'testonesite2014', localeSlug: 'nl' },
			},
		},

		currentUser: {
			id: 73705554,
		},
	};

	const frLangFRCountryState = {
		geo: {
			geo: {
				country_short: 'FR',
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
		expect( getCurrentUserPaymentMethods( enLangUsCountryState ) ).to.eql( [
			'credit-card',
			'paypal',
		] );
	} );

	test( 'en-DE should return CC, GiroPay, Paypal', () => {
		expect( getCurrentUserPaymentMethods( enLangDeCountryState ) ).to.eql( [
			'credit-card',
			'giropay',
			'paypal',
		] );
	} );

	test( 'de-DE should return CC, Giropay, Paypal', () => {
		expect( getCurrentUserPaymentMethods( deLangDeCountryState ) ).to.eql( [
			'credit-card',
			'giropay',
			'paypal',
		] );
	} );

	test( 'nl-NL should return credit card, iDEAL, PayPal ', () => {
		expect( getCurrentUserPaymentMethods( nlCountryState ) ).to.eql( [
			'credit-card',
			'ideal',
			'paypal',
		] );
	} );

	test( 'fr-FR should return credit card primary, PayPal secondary', () => {
		expect( getCurrentUserPaymentMethods( frLangFRCountryState ) ).to.eql( [
			'credit-card',
			'paypal',
		] );
	} );
} );
