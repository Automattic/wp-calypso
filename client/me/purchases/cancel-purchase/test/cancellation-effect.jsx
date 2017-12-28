/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { cancellationEffectDetail, cancellationEffectHeadline } from '../cancellation-effect';
import productsValues from 'client/lib/products-values';
import purchases from 'client/lib/purchases';

jest.mock( 'lib/products-values', () => ( {} ) );
jest.mock( 'lib/purchases', () => ( {} ) );

describe( 'cancellation-effect', () => {
	const purchase = { domain: 'example.com' };
	let translate;

	beforeEach( () => {
		purchases.getName = () => 'purchase name';
		translate = ( text, args ) => ( { args, text } );
	} );

	describe( 'cancellationEffectHeadline', () => {
		describe( 'when refundable', () => {
			beforeEach( () => {
				purchases.isRefundable = () => true;
			} );

			test( 'should return translation of cancel and return', () => {
				const headline = cancellationEffectHeadline( purchase, translate );
				expect( headline.text ).to.equal(
					'Are you sure you want to cancel and remove %(purchaseName)s from {{em}}%(domain)s{{/em}}? '
				);
			} );
		} );

		describe( 'when not refundable', () => {
			beforeEach( () => {
				purchases.isRefundable = () => false;
			} );

			test( 'should return translation of cancel', () => {
				const headline = cancellationEffectHeadline( purchase, translate );
				expect( headline.text ).to.equal(
					'Are you sure you want to cancel %(purchaseName)s for {{em}}%(domain)s{{/em}}? '
				);
			} );
		} );
	} );

	describe( 'cancellationEffectDetail', () => {
		describe( 'when refundable', () => {
			beforeEach( () => {
				purchases.isRefundable = () => true;
			} );

			test( 'should return translation of theme message when product is a theme', () => {
				productsValues.isTheme = () => true;
				const headline = cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					"Your site's appearance will revert to its previously selected theme and you will be refunded %(cost)s."
				);
			} );

			test( 'should return translation of g suite message when product is g suite', () => {
				productsValues.isTheme = () => false;
				productsValues.isGoogleApps = () => true;
				const headline = cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					'You will be refunded %(cost)s, but your G Suite account will continue working without interruption. ' +
						'You will be able to manage your G Suite billing directly through Google.'
				);
			} );

			test( 'should return translation of jetpack plan message when product is a jetpack plan', () => {
				productsValues.isTheme = () => false;
				productsValues.isGoogleApps = () => false;
				productsValues.isJetpackPlan = () => true;
				const headline = cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					'All plan features - spam filtering, backups, and security screening ' +
						'- will be removed from your site and you will be refunded %(cost)s.'
				);
			} );

			test( 'should return translation of plan message when product is not a theme, g suite or a jetpack plan', () => {
				productsValues.isTheme = () => false;
				productsValues.isGoogleApps = () => false;
				productsValues.isJetpackPlan = () => false;
				const headline = cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					'All plan features and custom changes will be removed from your site and you will be refunded %(cost)s.'
				);
			} );
		} );

		describe( 'when not refundable', () => {
			beforeEach( () => {
				purchases.isRefundable = () => false;
				purchases.getSubscriptionEndDate = () => '15/12/2093';
			} );

			test( 'should return translation of g suite message when product is g suite', () => {
				productsValues.isGoogleApps = () => true;
				const headline = cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					'Your G Suite account remains active until it expires on %(subscriptionEndDate)s.'
				);
			} );

			test( 'should return translation of domain mapping message when product is a domain mapping', () => {
				productsValues.isGoogleApps = () => false;
				productsValues.isDomainMapping = () => true;
				const headline = cancellationEffectDetail( purchase, translate );
				expect( headline.text ).to.equal(
					'Your domain mapping remains active until it expires on %(subscriptionEndDate)s.'
				);
			} );

			test( 'should return translation of plan message when product is not g suite or a domain mapping', () => {
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
