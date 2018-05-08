/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { update } from 'state/data-layer/http-data';
import { getCurrentUserPaymentMethods } from 'state/selectors';

describe( 'getCurrentUserPaymentMethods()', () => {
	const enLangUsCountryState = {
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
		users: {
			items: {
				73705554: { ID: 73705554, login: 'testonesite2014', localeSlug: 'de' },
			},
		},

		currentUser: {
			id: 73705554,
		},
	};

	const deLangAtCountryState = {
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
		users: {
			items: {
				73705554: { ID: 73705554, login: 'testonesite2014', localeSlug: 'nl' },
			},
		},

		currentUser: {
			id: 73705554,
		},
	};

	const PlCountryState = {
		users: {
			items: {
				73705554: { ID: 73705554, login: 'testonesite2014', localeSlug: 'pl' },
			},
		},

		currentUser: {
			id: 73705554,
		},
	};

	const frLangFRCountryState = {
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
		update( 'geo', 'success', 'US' );

		expect( getCurrentUserPaymentMethods( enLangUsCountryState ) ).to.eql( [
			'credit-card',
			'paypal',
		] );
	} );

	test( 'en-DE should return CC, GiroPay, Paypal', () => {
		update( 'geo', 'success', 'DE' );

		expect( getCurrentUserPaymentMethods( enLangDeCountryState ) ).to.eql( [
			'credit-card',
			'giropay',
			'paypal',
		] );
	} );

	test( 'de-DE should return CC, Giropay, Paypal', () => {
		update( 'geo', 'success', 'DE' );

		expect( getCurrentUserPaymentMethods( deLangDeCountryState ) ).to.eql( [
			'credit-card',
			'giropay',
			'paypal',
		] );
	} );

	test( 'de-AT should return CC, EPS, Paypal', () => {
		update( 'geo', 'success', 'AT' );

		expect( getCurrentUserPaymentMethods( deLangAtCountryState ) ).to.eql( [
			'credit-card',
			'eps',
			'paypal',
		] );
	} );

	test( 'nl-NL should return credit card, iDEAL, PayPal ', () => {
		update( 'geo', 'success', 'NL' );

		expect( getCurrentUserPaymentMethods( nlCountryState ) ).to.eql( [
			'credit-card',
			'ideal',
			'paypal',
		] );
	} );

	test( 'pl-PL should return credit card, p24, PayPal ', () => {
		update( 'geo', 'success', 'PL' );

		expect( getCurrentUserPaymentMethods( PlCountryState ) ).to.eql( [
			'credit-card',
			'p24',
			'paypal',
		] );
	} );

	test( 'fr-FR should return credit card primary, PayPal secondary', () => {
		update( 'geo', 'success', 'FR' );

		expect( getCurrentUserPaymentMethods( frLangFRCountryState ) ).to.eql( [
			'credit-card',
			'paypal',
		] );
	} );
} );
