/**
 * External dependencies
 */
import { expect } from 'chai';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'enrichedSurveyData', function() {
	let enrichedSurveyData;

	useMockery( mockery => {
		mockery.registerMock( 'lib/analytics', {} );
	} );

	before( function() {
		enrichedSurveyData = require( '../enrichedSurveyData' );
	} );

	it( 'should duplicate survey data if no site or purchase are provided', function() {
		expect(
			enrichedSurveyData( { key: 'value' }, moment() )
		).to.deep.equal(
			{
				key: 'value',
				purchase: null,
				purchaseId: null,
			}
		);
	} );

	it( 'should add purchase id and slug to survey data if purchase is provided', function() {
		const site = null;
		const purchase = { id: 'purchase id', productSlug: 'product slug' };
		expect(
			enrichedSurveyData( { key: 'value' }, moment(), site, purchase ).purchase
		).to.equal( 'product slug' );
	} );

	it( 'should add purchase id and slug to survey data if purchase is provided', function() {
		const site = null;
		const purchase = { id: 'purchase id', productSlug: 'product slug' };
		expect(
			enrichedSurveyData( { key: 'value' }, moment(), site, purchase ).purchase
		).to.equal( 'product slug' );
	} );

	it( 'should add daysSincePurchase to survey data when purchase.subscribedDate is provided', function() {
		const site = null;
		const purchase = { subscribedDate: '2017-01-09T03:00:00+00:00' };
		expect(
			enrichedSurveyData( {}, moment( '2017-01-19T03:00:00+00:00' ), site, purchase ).daysSincePurchase
		).to.equal( 10 );
	} );

	it( 'should add daysSinceSiteCreation to survey data when site.options.created_at is provided', function() {
		const site = {
			options: { created_at: '2017-01-09T03:00:00+00:00' }
		};
		const purchase = null;
		expect(
			enrichedSurveyData( {}, moment( '2017-01-19T03:00:00+00:00' ), site, purchase ).daysSinceSiteCreation
		).to.equal( 10 );
	} );
} );
