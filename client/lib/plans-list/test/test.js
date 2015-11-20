global.localStorage = require( 'localStorage' );

var assert = require( 'assert' );

var PlansList = require( 'lib/plans-list' ),
	data = require( './data' ),
	plansMockedData = data.plans;

describe( 'PlansList', function() {
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
