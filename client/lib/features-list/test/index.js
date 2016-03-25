
/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import { features as featuresMockedData } from './data';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'index', function() {
	let FeaturesList;

	useFakeDom();

	before( () => {
		FeaturesList = require( 'lib/features-list' );
	} );

	describe( 'initialize', function() {
		it( 'should populate the list of features', function() {
			const featuresList = FeaturesList();
			featuresList.initialize( featuresMockedData );

			assert.strictEqual( featuresList.get().length, featuresMockedData.length );
		} );

		it( 'should set attributes properly', function() {
			const featuresList = FeaturesList();
			featuresList.initialize( featuresMockedData );

			const freeBlog = featuresList.get().filter( function( feature ) {
				return feature.title === 'Free Blog';
			} )[0];

			const freeBlogFromMockedData = featuresMockedData.filter( function( feature ) {
				return feature.title === 'Free Blog';
			} )[0];

			for ( let prop in freeBlog ) {
				assert.strictEqual( freeBlog[ prop ], freeBlogFromMockedData[ prop ] );
			}
		} );
	} );
} );
