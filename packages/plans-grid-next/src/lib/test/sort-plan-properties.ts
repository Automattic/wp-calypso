/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
jest.mock( '../../hooks/data-store/is-popular-plan', () => ( {
	isPopularPlan: ( planSlug ) => planSlug === 'value_bundle',
} ) );
jest.mock( '@automattic/calypso-products', () => ( {
	isFreePlan: ( planSlug ) => planSlug === 'free_plan',
} ) );

import { sortPlans } from '../sort-plan-properties';
import type { GridPlan } from '../../types';

const planFree = {
	pricing: { originalPrice: { full: 0, monthly: 0 } },
	planSlug: 'free_plan',
} as GridPlan;

const planPersonal = {
	pricing: { originalPrice: { full: 100, monthly: 0 } },
	planSlug: 'personal-bundle',
} as GridPlan;

const planPremium = {
	pricing: { originalPrice: { full: 200, monthly: 0 } },
	planSlug: 'value_bundle',
} as GridPlan;

const planBusiness = {
	pricing: { originalPrice: { full: 300, monthly: 0 } },
	planSlug: 'business-bundle',
} as GridPlan;

const planEcommerce = {
	pricing: { originalPrice: { full: 500, monthly: 0 } },
	planSlug: 'ecommerce-bundle',
} as GridPlan;

const plansInDefaultOrder = [ planFree, planPersonal, planPremium, planBusiness, planEcommerce ];

describe( 'sortPlans', () => {
	it( 'should return an empty array if no plans are provided', () => {
		expect( sortPlans( [] ) ).toEqual( [] );
	} );

	it( 'should return the original order if no current plan is specified', () => {
		expect( sortPlans( plansInDefaultOrder ) ).toEqual( plansInDefaultOrder );
	} );

	it( 'should return the original order if current plan is null', () => {
		expect( sortPlans( plansInDefaultOrder, null ) ).toEqual( plansInDefaultOrder );
	} );

	it( 'should return the original order if current plan is undefined', () => {
		expect( sortPlans( plansInDefaultOrder, undefined ) ).toEqual( plansInDefaultOrder );
	} );

	it( 'should return the original order if current plan is not found in the plans array', () => {
		expect( sortPlans( plansInDefaultOrder, 'non-existent-plan' ) ).toEqual( plansInDefaultOrder );
	} );

	it( 'should prioritize the current plan when specified', () => {
		// When personal plan is current
		expect( sortPlans( plansInDefaultOrder, 'personal-bundle' ) ).toEqual( [
			planPersonal,
			planFree,
			planPremium,
			planBusiness,
			planEcommerce,
		] );

		// When premium plan is current
		expect( sortPlans( plansInDefaultOrder, 'value_bundle' ) ).toEqual( [
			planPremium,
			planFree,
			planPersonal,
			planBusiness,
			planEcommerce,
		] );

		// When business plan is current
		expect( sortPlans( plansInDefaultOrder, 'business-bundle' ) ).toEqual( [
			planBusiness,
			planFree,
			planPersonal,
			planPremium,
			planEcommerce,
		] );

		// When ecommerce plan is current
		expect( sortPlans( plansInDefaultOrder, 'ecommerce-bundle' ) ).toEqual( [
			planEcommerce,
			planFree,
			planPersonal,
			planPremium,
			planBusiness,
		] );

		// When free plan is current
		expect( sortPlans( plansInDefaultOrder, 'free_plan' ) ).toEqual( [
			planFree,
			planPersonal,
			planPremium,
			planBusiness,
			planEcommerce,
		] );
	} );

	it( 'should work with a single plan', () => {
		const singlePlan = [ planFree ];
		expect( sortPlans( singlePlan, 'free_plan' ) ).toEqual( [ planFree ] );
	} );

	it( 'should preserve the original array', () => {
		const originalArray = [ ...plansInDefaultOrder ];
		sortPlans( plansInDefaultOrder, 'personal-bundle' );
		expect( plansInDefaultOrder ).toEqual( originalArray );
	} );
} );
