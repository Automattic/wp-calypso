/**
 * External dependencies
 */
import { assert } from 'chai';
import { map, noop } from 'lodash';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';
import mockConfig from 'test/helpers/mocks/config';

describe( 'StatsParser', () => {
	let statsParser, data;

	useMockery( mockery => {
		mockery.registerMock( 'lib/wp', {
			me: () => ( {
				get: noop
			} )
		} );
		mockConfig( mockery );
	} );
	useFakeDom();

	before( () => {
		statsParser = require( '../stats-parser' )();
		data = require( './fixtures/data' );
	} );

	describe( 'stat types', () => {
		it( 'should have a statsClicks function', () => {
			assert.isFunction( statsParser.statsClicks, 'it should have a statsClick function' );
		} );

		it( 'should have a statsTags function', () => {
			assert.isFunction( statsParser.statsTags, 'it should have a statsTag function' );
		} );
	} );

	describe( 'statsClicks', () => {
		it( 'should parse a clicks response properly', () => {
			// we have to pass in some context to calculate start of period on this call
			const mockContext = { options: { period: 'day', date: '2014-09-12' } };
			const response = statsParser.statsClicks.call( mockContext, data.successResponses.statsClicks.body );

			assert.lengthOf( response.data, 10 );
			assert.equal( response.data[ 0 ].label, 'example.com' );
			assert.equal( response.data[ 0 ].value, 126 );
			assert.isNull( response.data[ 0 ].children );
			assert.isNull( response.data[ 0 ].icon );

			assert.lengthOf( response.data[ 2 ].children, 3 ); // check a record with children
		} );
	} );

	describe( 'statsTags', () => {
		it( 'should parse tags response properly', () => {
			const response = statsParser.statsTags( data.successResponses.statsTags.body );
			const item = response.data[ 2 ];

			assert.lengthOf( response.data, 9 );

			// tags labels are arrays of labels, right?
			assert.isArray( item.label, 'Label should be array' );
			assert.deepEqual( map( item.label, 'label' ), [ 'supertag', 'supertag-transition' ] );
			assert.deepEqual( map( item.label, 'labelIcon' ), [ 'tag', 'tag' ] );
			assert.isNull( item.label[ 0 ].link );
			assert.equal( item.value, 480 );
		} );
	} );

	describe( 'statsCountryViews', () => {
		it( 'should parse countryViews payload properly', () => {
			const mockContext = { options: { period: 'day', date: '2014-09-12' } };
			const response = statsParser.statsCountryViews.call( mockContext, data.successResponses.statsCountryViews.body );
			const item = response.data[ 0 ];

			assert.lengthOf( response.data, 5 );
			assert.equal( item.label, 'United States' );
			assert.equal( item.value, 54 );
		} );
	} );
} );
