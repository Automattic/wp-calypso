require( 'lib/react-test-env-setup' )();

// External Dependencies
var assert = require('chai').assert;

var statsParser = require( '../stats-parser' )(),
	data = require( './data' ),
	dataSets = [ 'statsClicks', 'statsTags' ];

// helper functions
describe( 'StatsParser', function() {

	dataSets.forEach( function( statType ) {
		it( 'should have a ' + statType + ' function', function() {
			assert.typeOf( statsParser[ statType ], 'function', 'It should have the function' );
		} );
	}, this );

	describe( 'statsClicks', function() {
		it( 'should parse a clicks response properly', function() {
			var mockContext = { options: { period: 'day', date: '2014-09-12' } }, // we have to pass in some context to calculate start of period on this call
				response = statsParser.statsClicks.call( mockContext, data.successResponses.statsClicks.body );
			assert.equal( response.data.length, 10 );

			assert.equal( response.data[ 0 ].label, 'example.com' );
			assert.equal( response.data[ 0 ].value, 126 );
			assert.isNull( response.data[ 0 ].children );
			assert.isNull( response.data[ 0 ].icon );

			assert.equal( response.data[ 2 ].children.length, 3 ); // check a record with children
		} );
	} );

	describe( 'statsTags', function() {
		it( 'should parse tags response properly', function() {
			var response = statsParser.statsTags( data.successResponses.statsTags.body ),
			item = response.data[ 2 ];

			assert.equal( response.data.length, 9 );

			// tags labels are arrays of labels, right?
			assert.typeOf( item.label, 'array', 'Label should be array' );
			assert.equal( item.label.map( function( label ) { return label.label; } ).join( ' ' ), 'supertag supertag-transition' );
			assert.equal( item.label.map( function( label ) { return label.labelIcon; } ).join( ' ' ), 'tag tag' );
			assert.equal( item.label[0].link, null );
			assert.equal( item.value, 480 );

		} );
	} );

	describe( 'statsCountryViews', function() {
		it( 'should parse countryViews payload properly', function() {
			var mockContext = { options: { period: 'day', date: '2014-09-12' } },
				response = statsParser.statsCountryViews.call( mockContext, data.successResponses.statsCountryViews.body ),
				item = response.data[ 0 ];

			assert.equal( response.data.length, 5 );
			assert.equal( item.label, 'United States' );
			assert.equal( item.value, 54 );


		} );
	} );
	
} );
