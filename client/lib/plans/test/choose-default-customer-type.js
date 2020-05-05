/**
 * Internal dependencies
 */
import { chooseDefaultCustomerType } from '..';
import { PLAN_ECOMMERCE_2_YEARS, PLAN_PREMIUM, PLAN_FREE, PLAN_PERSONAL } from '../constants';

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

	test( 'chooses "personal" either if site is on a free plan or on the Personal plan ', () => {
		const currentPlan = {
			product_slug: PLAN_FREE,
		};
		expect( chooseDefaultCustomerType( { currentPlan } ) ).toBe( 'personal' );

		currentPlan.product_slug = PLAN_PERSONAL;
		expect( chooseDefaultCustomerType( { currentPlan } ) ).toBe( 'personal' );
	} );

	test( 'chooses "business" either if site on the Premium plan or Business plan', () => {
		const currentPlan = {
			product_slug: PLAN_PREMIUM,
		};
		expect( chooseDefaultCustomerType( { currentPlan } ) ).toBe( 'business' );

		currentPlan.product_slug = PLAN_ECOMMERCE_2_YEARS;
		expect( chooseDefaultCustomerType( { currentPlan } ) ).toBe( 'business' );
	} );
} );
