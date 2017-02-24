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
		enrichedSurveyData = require( '../utils' ).enrichedSurveyData;
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
} );
