/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import { plans as plansMockedData } from './data';
import useFakeDom from 'test/helpers/use-fake-dom';
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';

describe( 'PlansList', function() {
	let PlansList;

	useFakeDom();
	useFilesystemMocks( __dirname );

	before( () => {
		PlansList = require( 'lib/plans-list' )
	} );

	describe( 'initialize', function() {
		it( 'should populate the list of plans', function() {
			var plansList = PlansList();
			plansList.initialize( plansMockedData );

			assert.strictEqual( plansList.get().length, plansMockedData.length );
		} );

		it( 'should set attributes properly', function() {
			var plansList = PlansList();
			plansList.initialize( plansMockedData );

			var premiumPlan = plansList.get().filter( function( plan ) {
				return plan.product_id === 1003;
			} );

			for ( var prop in premiumPlan ) {
				assert.strictEqual( premiumPlan[ prop ], plansMockedData[ prop ] );
			}
		} );
	} );
} );
