import {
	getPlanSlugForTermVariant,
	PLAN_JETPACK_GROWTH_BI_YEARLY,
	PLAN_JETPACK_GROWTH_MONTHLY,
	PLAN_JETPACK_GROWTH_YEARLY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_PERSONAL_3_YEARS,
	PLAN_PERSONAL_MONTHLY,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
} from '../src/index';

describe( 'getPlanSlugForTermVariant', () => {
	test( 'should return the matching plan variant for the requested term', () => {
		expect( getPlanSlugForTermVariant( PLAN_JETPACK_GROWTH_MONTHLY, TERM_ANNUALLY ) ).toEqual(
			PLAN_JETPACK_GROWTH_YEARLY
		);
		expect( getPlanSlugForTermVariant( PLAN_JETPACK_GROWTH_YEARLY, TERM_BIENNIALLY ) ).toEqual(
			PLAN_JETPACK_GROWTH_BI_YEARLY
		);
		expect( getPlanSlugForTermVariant( PLAN_PERSONAL_MONTHLY, TERM_TRIENNIALLY ) ).toEqual(
			PLAN_PERSONAL_3_YEARS
		);
	} );

	test( 'should return undefined when no matching term variant exists', () => {
		expect(
			getPlanSlugForTermVariant( PLAN_JETPACK_PERSONAL_MONTHLY, TERM_BIENNIALLY )
		).toBeUndefined();
		expect( getPlanSlugForTermVariant( 'unknown_plan', TERM_ANNUALLY ) ).toBeUndefined();
	} );
} );
