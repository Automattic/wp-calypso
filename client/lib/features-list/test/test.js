global.localStorage = require( 'localStorage' );

var assert = require( 'assert' );

var FeaturesList = require( 'lib/features-list' ),
	data = require( './data' ),
	featuresMockedData = data.features;

describe( 'FeaturesList', function() {
	describe( 'initialize', function() {
		it( 'should populate the list of features', function() {
			var featuresList = FeaturesList();
			featuresList.initialize( featuresMockedData );

			assert.strictEqual( featuresList.get().length, featuresMockedData.length );
		} );

		it( 'should set attributes properly', function() {
			var featuresList = FeaturesList();
			featuresList.initialize( featuresMockedData );

			var freeBlog = featuresList.get().filter( function( feature ) {
				return feature.title === 'Free Blog';
			} )[0];


			var freeBlogFromMockedData = featuresMockedData.filter( function( feature ) {
				return feature.title === 'Free Blog';
			} )[0];

			for ( var prop in freeBlog ) {
				assert.strictEqual( freeBlog[ prop ], freeBlogFromMockedData[ prop ] );
			}
		} );

	} );

} );
