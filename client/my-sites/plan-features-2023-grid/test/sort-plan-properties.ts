import { sortPlanProperties } from '../lib/sort-plan-properties';
import type { PlanProperties } from '../types';

describe( 'sortPlanProperties', () => {
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
		expect( sortPlanProperties( defaultPlanOrder ) ).toEqual( defaultPlanOrder );
	} );

	it( 'should sort plans in descending order of value when current plan slug is personal', () => {
		expect( sortPlanProperties( defaultPlanOrder, 'personal' ) ).toEqual( [
			planPersonal,
			planPremium,
			planBusiness,
			planEcommerce,
			planFree,
		] );
	} );

	it( 'should sort plans in descending order of value when current plan slug is ecommerce', () => {
		expect( sortPlanProperties( defaultPlanOrder, 'ecommerce' ) ).toEqual( [
			planEcommerce,
			planBusiness,
			planPremium,
			planPersonal,
			planFree,
		] );
	} );
} );
