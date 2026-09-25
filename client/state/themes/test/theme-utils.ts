import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_FREE,
	PLAN_PERSONAL_MONTHLY,
} from '@automattic/calypso-products';
import { getExternallyManagedThemeRequiredPlanSlug } from '../theme-utils';

describe( 'getExternallyManagedThemeRequiredPlanSlug', () => {
	it( 'returns the annual Business plan for sites without a plan or on the Free plan', () => {
		expect( getExternallyManagedThemeRequiredPlanSlug() ).toBe( PLAN_BUSINESS );
		expect( getExternallyManagedThemeRequiredPlanSlug( PLAN_FREE ) ).toBe( PLAN_BUSINESS );
	} );

	it( 'returns the Business plan on the same term as the current plan', () => {
		expect( getExternallyManagedThemeRequiredPlanSlug( PLAN_PERSONAL_MONTHLY ) ).toBe(
			PLAN_BUSINESS_MONTHLY
		);
	} );

	it( 'returns the eCommerce plan for sites on the eCommerce trial', () => {
		expect( getExternallyManagedThemeRequiredPlanSlug( PLAN_ECOMMERCE_TRIAL_MONTHLY ) ).toBe(
			PLAN_ECOMMERCE_MONTHLY
		);
	} );
} );
