jest.mock( 'lib/products-values', () => ( {} ) );
jest.mock( 'lib/purchases', () => ( {} ) );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	cancellationEffectDetail,
	cancellationEffectHeadline
} from '../cancellation-effect';
import productsValues from 'lib/products-values';
import purchases from 'lib/purchases';

describe( 'cancellation-effect', function() {
	const purchase = { domain: 'example.com' };
	let translate;

	beforeEach( function() {
		purchases.getName = () => 'purchase name';
		translate = ( text, args ) => ( { args, text } );
	} );

	describe( 'cancellationEffectHeadline', function() {
		describe( 'when refundable', function() {
			beforeEach( function() {
				purchases.isRefundable = () => true;
			} );

			it( 'should return translation of cancel and return', function() {
				const headline = cancellationEffectHeadline( purchase, translate );
				expect( headline.text ).to.equal(
					'Are you sure you want to cancel and remove %(purchaseName)s from {{em}}%(domain)s{{/em}}? '
				);
			} );
		} );

		describe( 'when not refundable', function() {
			beforeEach( function() {
				purchases.isRefundable = () => false;
			} );

			it( 'should return translation of cancel', function() {
				const headline = cancellationEffectHeadline( purchase, translate );
				expect( headline.text ).to.equal(
					'Are you sure you want to cancel %(purchaseName)s for {{em}}%(domain)s{{/em}}? '
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
				const headline = cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					"Your site's appearance will revert to its previously selected theme and you will be refunded %(cost)s."
				);
			} );

			it( 'should return translation of g suite message when product is g suite', function() {
				productsValues.isTheme = () => false;
				productsValues.isGoogleApps = () => true;
				const headline = cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					'You will be refunded %(cost)s, but your G Suite account will continue working without interruption. ' +
						'You will be able to manage your G Suite billing directly through Google.'
				);
			} );

			it( 'should return translation of jetpack plan message when product is a jetpack plan', function() {
				productsValues.isTheme = () => false;
				productsValues.isGoogleApps = () => false;
				productsValues.isJetpackPlan = () => true;
				const headline = cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					'All plan features - spam filtering, backups, and security screening ' +
						'- will be removed from your site and you will be refunded %(cost)s.'
				);
			} );

			it( 'should return translation of plan message when product is not a theme, g suite or a jetpack plan', function() {
				productsValues.isTheme = () => false;
				productsValues.isGoogleApps = () => false;
				productsValues.isJetpackPlan = () => false;
				const headline = cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					'All plan features and custom changes will be removed from your site and you will be refunded %(cost)s.'
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
				const headline = cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					'Your G Suite account remains active until it expires on %(subscriptionEndDate)s.'
				);
			} );

			it( 'should return translation of domain mapping message when product is a domain mapping', function() {
				productsValues.isGoogleApps = () => false;
				productsValues.isDomainMapping = () => true;
				const headline = cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					'Your domain mapping remains active until it expires on %(subscriptionEndDate)s.'
				);
			} );

			it( 'should return translation of plan message when product is not g suite or a domain mapping', function() {
				productsValues.isGoogleApps = () => false;
				productsValues.isDomainMapping = () => false;
				const headline = cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					"Your plan's features remain active until your subscription expires on %(subscriptionEndDate)s."
				);
			} );
		} );
	} );
} );
