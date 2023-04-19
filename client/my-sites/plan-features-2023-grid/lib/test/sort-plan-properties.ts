import { isFreePlan } from '@automattic/calypso-products';
import { isPopularPlan } from '../is-popular-plan';
import { sortPlans } from '../sort-plan-properties';
import type { PlanProperties } from '../../types';

jest.mock( '../is-popular-plan' );
jest.mock( '@automattic/calypso-products' );

describe( 'sortPlans', () => {
	const planFree = {
		rawPrice: 0,
		planName: 'free',
	} as PlanProperties;

	const planPersonal = {
		rawPrice: 100,
		planName: 'personal',
	} as PlanProperties;

	const planPremium = {
		rawPrice: 200,
		planName: 'premium',
	} as PlanProperties;

	const planBusiness = {
		rawPrice: 300,
		planName: 'business',
	} as PlanProperties;

	const planEcommerce = {
		rawPrice: 500,
		planName: 'ecommerce',
	} as PlanProperties;

	const defaultPlanOrder = [ planFree, planPersonal, planPremium, planBusiness, planEcommerce ];

	it( 'should sort plans in default order when current plan slug is empty', () => {
		expect( sortPlans( defaultPlanOrder ) ).toEqual( defaultPlanOrder );
	} );

	it( 'should sort plans in descending order of value when current plan slug is personal', () => {
		expect( sortPlans( defaultPlanOrder, 'personal' ) ).toEqual( [
			planPersonal,
			planPremium,
			planBusiness,
			planEcommerce,
			planFree,
		] );
	} );

	it( 'should sort plans in descending order of value when current plan slug is ecommerce', () => {
		expect( sortPlans( defaultPlanOrder, 'ecommerce' ) ).toEqual( [
			planEcommerce,
			planBusiness,
			planPremium,
			planPersonal,
			planFree,
		] );
	} );

	it( 'should show the popular plan first if current plan slug is empty', () => {
		isPopularPlan.mockImplementation( ( planSlug ) => planSlug === 'premium' );
		expect( sortPlans( defaultPlanOrder ) ).toEqual( [
			planPremium,
			planBusiness,
			planEcommerce,
			planPersonal,
			planFree,
		] );
	} );

	it( 'should show the popular plan first if current plan slug is the free plan', () => {
		isPopularPlan.mockImplementation( ( planSlug ) => planSlug === 'premium' );
		isFreePlan.mockImplementation( ( planSlug ) => planSlug === 'free' );
		expect( sortPlans( defaultPlanOrder, 'free' ) ).toEqual( [
			planPremium,
			planBusiness,
			planEcommerce,
			planPersonal,
			planFree,
		] );
	} );

	it( 'should show the popular plan second if current plan slug is empty/free and user is on mobile', () => {
		isPopularPlan.mockImplementation( ( planSlug ) => planSlug === 'premium' );
		isFreePlan.mockImplementation( ( planSlug ) => planSlug === 'free' );
		expect( sortPlans( defaultPlanOrder, 'free', true ) ).toEqual( [
			planPersonal,
			planPremium,
			planBusiness,
			planEcommerce,
			planFree,
		] );
	} );
} );
