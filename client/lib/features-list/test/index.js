
/**
 * External dependencies
 */
var assert = require( 'assert' );

/**
 * Internal dependencies
 */
var data = require( './data' ),
	featuresMockedData = data.features,
	useFakeDom = require( 'test/helpers/use-fake-dom' );

describe( 'index', function() {
	let FeaturesList;

	useFakeDom();

	before( () => {
		FeaturesList = require( 'lib/features-list' );
	});

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
