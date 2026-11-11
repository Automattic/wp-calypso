import { getBlueprintPlanHideProps } from '../get-blueprint-plan-hide-props';

describe( 'getBlueprintPlanHideProps', () => {
	it( 'returns no props when the blueprint suggests no plans', () => {
		expect( getBlueprintPlanHideProps( [] ) ).toEqual( {} );
	} );

	it( 'hides every plan the blueprint does not suggest', () => {
		expect( getBlueprintPlanHideProps( [ 'value_bundle', 'business-bundle' ] ) ).toEqual( {
			hideFreePlan: true,
			hidePersonalPlan: true,
			hidePremiumPlan: false,
			hideBusinessPlan: false,
			hideEcommercePlan: true,
		} );
	} );

	it( 'keeps only the one suggested plan', () => {
		expect( getBlueprintPlanHideProps( [ 'value_bundle' ] ) ).toEqual( {
			hideFreePlan: true,
			hidePersonalPlan: true,
			hidePremiumPlan: false,
			hideBusinessPlan: true,
			hideEcommercePlan: true,
		} );
	} );

	it( 'matches any billing term of a suggested plan', () => {
		expect(
			getBlueprintPlanHideProps( [ 'personal-bundle-monthly', 'ecommerce-bundle-2y' ] )
		).toEqual( {
			hideFreePlan: true,
			hidePersonalPlan: false,
			hidePremiumPlan: true,
			hideBusinessPlan: true,
			hideEcommercePlan: false,
		} );
	} );

	it( 'hides all paid plans when only a slug it cannot place is suggested', () => {
		expect( getBlueprintPlanHideProps( [ 'not-a-plan' ] ) ).toEqual( {
			hideFreePlan: true,
			hidePersonalPlan: true,
			hidePremiumPlan: true,
			hideBusinessPlan: true,
			hideEcommercePlan: true,
		} );
	} );
} );
