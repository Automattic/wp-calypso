/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { update } from 'state/data-layer/http-data';
import getCurrentUserPaymentMethods from 'state/selectors/get-current-user-payment-methods';

describe( 'getCurrentUserPaymentMethods()', () => {
	function countryStateFromLocale(slug) {
		return {
			users: {
				items: {
					73705554: {
						ID: 73705554,
						login: 'testonesite2014',
						localeSlug: slug
					},
				},
			},

			currentUser: {
				id: 73705554,
			},
		};
	}


	test( 'en-US should return credit card primary, PayPal secondary', () => {
		update( 'geo', 'success', 'US' );

		expect( getCurrentUserPaymentMethods( countryStateFromLocale('en') ) ).to.eql( [
			'credit-card',
			'paypal',
		] );
	} );

	test( 'en-DE should return CC, GiroPay, Paypal', () => {
		update( 'geo', 'success', 'DE' );

		expect( getCurrentUserPaymentMethods( countryStateFromLocale('en') ) ).to.eql( [
			'credit-card',
			'giropay',
			'paypal',
		] );
	} );

	test( 'de-DE should return CC, Giropay, Paypal', () => {
		update( 'geo', 'success', 'DE' );

		expect( getCurrentUserPaymentMethods( countryStateFromLocale('de') ) ).to.eql( [
			'credit-card',
			'giropay',
			'paypal',
		] );
	} );

	test( 'de-AT should return CC, EPS, Paypal', () => {
		update( 'geo', 'success', 'AT' );

		expect( getCurrentUserPaymentMethods( countryStateFromLocale('de') ) ).to.eql( [
			'credit-card',
			'eps',
			'paypal',
		] );
	} );

	test( 'nl-NL should return credit card, iDEAL, PayPal ', () => {
		update( 'geo', 'success', 'NL' );

		expect( getCurrentUserPaymentMethods( countryStateFromLocale('nl') ) ).to.eql( [
			'credit-card',
			'ideal',
			'paypal',
		] );
	} );

	test( 'pl-PL should return credit card, p24, PayPal ', () => {
		update( 'geo', 'success', 'PL' );

		expect( getCurrentUserPaymentMethods( countryStateFromLocale('pl') ) ).to.eql( [
			'credit-card',
			'p24',
			'paypal',
		] );
	} );

	test( 'fr-FR should return credit card primary, PayPal secondary', () => {
		update( 'geo', 'success', 'FR' );

		expect( getCurrentUserPaymentMethods( countryStateFromLocale('fr') ) ).to.eql( [
			'credit-card',
			'paypal',
		] );
	} );

	test( 'BR should return credit card primary, tef, and PayPal secondary', () => {
		update( 'geo', 'success', 'BR' );

		const countryState = countryStateFromLocale('pt-br');

		countryState.geo = {
			geo: {
				country_short: 'BR',
			},
		};

		expect( getCurrentUserPaymentMethods( countryState ) ).to.eql( [
			'credit-card',
			'brazil-tef',
			'paypal',
		] );
	} );

	test( 'zh-CN should return CC, Alipay, WeChat, PayPal', () => {
		update( 'geo', 'success', 'CN' );

		expect( getCurrentUserPaymentMethods( countryStateFromLocale('cn') ) ).to.eql( [
			'credit-card', 'alipay', 'wechat', 'paypal'
		] );
	} );

} );
