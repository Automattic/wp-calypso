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
	it( 'should sort plans in descending order of value when current plan slug is personal', () => {
		expect( sortPlans( plansInDefaultOrder, 'personal-bundle' ) ).toEqual( [
			planPersonal,
			planPremium,
			planBusiness,
			planEcommerce,
			planFree,
		] );
	} );

	it( 'should sort plans in descending order of value when current plan slug is ecommerce', () => {
		expect( sortPlans( plansInDefaultOrder, 'ecommerce-bundle' ) ).toEqual( [
			planEcommerce,
			planBusiness,
			planPremium,
			planPersonal,
			planFree,
		] );
	} );

	it( 'should show the popular plan first if current plan slug is empty', () => {
		expect( sortPlans( plansInDefaultOrder ) ).toEqual( [
			planPremium,
			planBusiness,
			planEcommerce,
			planPersonal,
			planFree,
		] );
	} );

	it( 'should show the popular plan first when current plan slug is empty', () => {
		expect( sortPlans( plansInDefaultOrder ) ).toEqual( [
			planPremium,
			planBusiness,
			planEcommerce,
			planPersonal,
			planFree,
		] );
	} );

	it( 'should show the popular plan first if current plan slug is the free plan', () => {
		expect( sortPlans( plansInDefaultOrder, 'free_plan' ) ).toEqual( [
			planPremium,
			planBusiness,
			planEcommerce,
			planPersonal,
			planFree,
		] );
	} );

	it( 'should show the popular plan second if current plan slug is empty/free and user is on mobile', () => {
		expect( sortPlans( plansInDefaultOrder, 'free_plan', true ) ).toEqual( [
			planPersonal,
			planPremium,
			planBusiness,
			planEcommerce,
			planFree,
		] );
	} );
} );
