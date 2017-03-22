/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'cancellation-effect', function() {
	const purchase = { domain: 'example.com' };
	const purchases = {};
	const productsValues = {};
	let cancellationEffect;
	let translate;

	useMockery( mockery => {
		mockery.registerMock( 'lib/purchases', purchases );
		mockery.registerMock( 'lib/products-values', productsValues );
	} );

	beforeEach( function() {
		purchases.getName = () => 'purchase name';
		translate = ( text, args ) => ( { args, text } );
		cancellationEffect = require( '../cancellation-effect' );
	} );

	describe( 'cancellationEffectHeadline', function() {
		describe( 'when refundable', function() {
			beforeEach( function() {
				purchases.isRefundable = () => true;
			} );

			it( 'should return translation of cancel and return', function() {
				const headline = cancellationEffect.cancellationEffectHeadline( purchase, translate );
				expect( headline.text ).to.equal(
					'Are you sure you want to cancel and remove %(purchaseName)s from {{em}}%(domain)s{{/em}}? ',
				);
			} );
		} );

		describe( 'when not refundable', function() {
			beforeEach( function() {
				purchases.isRefundable = () => false;
			} );

			it( 'should return translation of cancel', function() {
				const headline = cancellationEffect.cancellationEffectHeadline( purchase, translate );
				expect( headline.text ).to.equal(
					'Are you sure you want to cancel %(purchaseName)s for {{em}}%(domain)s{{/em}}? ',
				);
			} );
		} );
	} );

	describe( 'cancellationEffectDetail', function() {
		describe( 'when refundable', function() {
			beforeEach( function() {
				purchases.isRefundable = () => true;
			} );

			it( 'should return translation of theme message when product is a theme', function() {
				productsValues.isTheme = () => true;
				const headline = cancellationEffect.cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					"Your site's appearance will revert to its previously selected theme and you will be refunded %(cost)s."
				);
			} );
		} );

		describe( 'when not refundable', function() {
			beforeEach( function() {
				purchases.isRefundable = () => false;
				purchases.getSubscriptionEndDate = () => '15/12/2093';
			} );

			it( 'should return translation of g suite message when product is g suite', function() {
				productsValues.isGoogleApps = () => true;
				const headline = cancellationEffect.cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					'Your G Suite account remains active until it expires on %(subscriptionEndDate)s.'
				);
			} );
		} );
	} );
} );
