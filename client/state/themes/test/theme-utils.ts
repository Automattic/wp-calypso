import {
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PERSONAL_MONTHLY,
} from '@automattic/calypso-products';
import { getExternallyManagedThemeRequiredPlanSlug } from '../theme-utils';

describe( 'getExternallyManagedThemeRequiredPlanSlug', () => {
	it( 'returns the annual Personal plan for sites without a plan or on the Free plan', () => {
		expect( getExternallyManagedThemeRequiredPlanSlug() ).toBe( PLAN_PERSONAL );
		expect( getExternallyManagedThemeRequiredPlanSlug( PLAN_FREE ) ).toBe( PLAN_PERSONAL );
	} );

	it( 'returns the Personal plan on the same term as the current plan', () => {
		expect( getExternallyManagedThemeRequiredPlanSlug( PLAN_PERSONAL_MONTHLY ) ).toBe(
			PLAN_PERSONAL_MONTHLY
		);
	} );

	it( 'returns the eCommerce plan for sites on the eCommerce trial', () => {
		expect( getExternallyManagedThemeRequiredPlanSlug( PLAN_ECOMMERCE_TRIAL_MONTHLY ) ).toBe(
			PLAN_ECOMMERCE_MONTHLY
		);
	} );
} );
