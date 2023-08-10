import { chooseDefaultCustomerType } from '../src';
import {
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_PREMIUM,
	PLAN_FREE,
	PLAN_WPCOM_FLEXIBLE,
	PLAN_PERSONAL,
	PLAN_WPCOM_PRO,
} from '../src/constants';

describe( 'chooseDefaultCustomerType', () => {
	test( 'chooses "personal" if current site type is "personal"', () => {
		const customerType = chooseDefaultCustomerType( {
			currentCustomerType: 'personal',
		} );
		expect( customerType ).toBe( 'personal' );
	} );

	test( 'chooses "business" if current site type is "business"', () => {
		const customerType = chooseDefaultCustomerType( {
			currentCustomerType: 'business',
		} );
		expect( customerType ).toBe( 'business' );
	} );

	test( 'chooses "personal" either if site is on a free plan or on the Personal plan', () => {
		const currentPlan = {
			productSlug: PLAN_FREE,
		};
		expect( chooseDefaultCustomerType( { currentPlan } ) ).toBe( 'personal' );

		currentPlan.productSlug = PLAN_PERSONAL;
		expect( chooseDefaultCustomerType( { currentPlan } ) ).toBe( 'personal' );
	} );

	test( 'chooses "business" either if site on the Premium plan or Business plan', () => {
		const currentPlan = {
			productSlug: PLAN_PREMIUM,
		};
		expect( chooseDefaultCustomerType( { currentPlan } ) ).toBe( 'business' );

		currentPlan.productSlug = PLAN_ECOMMERCE_2_YEARS;
		expect( chooseDefaultCustomerType( { currentPlan } ) ).toBe( 'business' );
	} );

	test( 'chooses "business" if the site is on the Pro plan', () => {
		const currentPlan = {
			productSlug: PLAN_WPCOM_PRO,
		};
		expect( chooseDefaultCustomerType( { currentPlan } ) ).toBe( 'business' );
	} );

	test( 'chooses "personal" if the site is on the Flexible plan', () => {
		const currentPlan = {
			productSlug: PLAN_WPCOM_FLEXIBLE,
		};
		expect( chooseDefaultCustomerType( { currentPlan } ) ).toBe( 'personal' );
	} );
} );
