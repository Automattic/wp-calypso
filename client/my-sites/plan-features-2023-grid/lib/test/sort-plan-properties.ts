import { sortPlans } from '../sort-plan-properties';
import type { PlanProperties } from '../../types';

jest.mock( '../../hooks/npm-ready/data-store/is-popular-plan', () => ( {
	isPopularPlan: ( planSlug ) => planSlug === 'premium',
} ) );
jest.mock( '@automattic/calypso-products', () => ( {
	isFreePlan: ( planSlug ) => planSlug === 'free',
} ) );

describe( 'sortPlans', () => {
	const planFree = {
		rawPrice: 0,
		planName: 'free',
	} as unknown as PlanProperties;

	const planPersonal = {
		rawPrice: 100,
		planName: 'personal',
	} as unknown as PlanProperties;

	const planPremium = {
		rawPrice: 200,
		planName: 'premium',
	} as unknown as PlanProperties;

	const planBusiness = {
		rawPrice: 300,
		planName: 'business',
	} as unknown as PlanProperties;

	const planEcommerce = {
		rawPrice: 500,
		planName: 'ecommerce',
	} as unknown as PlanProperties;

	const plansInDefaultOrder = [ planFree, planPersonal, planPremium, planBusiness, planEcommerce ];

	it( 'should sort plans in descending order of value when current plan slug is personal', () => {
		expect( sortPlans( plansInDefaultOrder, 'personal' ) ).toEqual( [
			planPersonal,
			planPremium,
			planBusiness,
			planEcommerce,
			planFree,
		] );
	} );

	it( 'should sort plans in descending order of value when current plan slug is ecommerce', () => {
		expect( sortPlans( plansInDefaultOrder, 'ecommerce' ) ).toEqual( [
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
		expect( sortPlans( plansInDefaultOrder, 'free' ) ).toEqual( [
			planPremium,
			planBusiness,
			planEcommerce,
			planPersonal,
			planFree,
		] );
	} );

	it( 'should show the popular plan second if current plan slug is empty/free and user is on mobile', () => {
		expect( sortPlans( plansInDefaultOrder, 'free', true ) ).toEqual( [
			planPersonal,
			planPremium,
			planBusiness,
			planEcommerce,
			planFree,
		] );
	} );
} );
