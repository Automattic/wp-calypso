/** @format */
/**
 * Internal dependencies
 */
import { chooseDefaultCustomerType } from '..';

describe( 'chooseDefaultCustomerType', () => {
	describe( 'popularPlanBy A/B test === siteType', () => {
		const abtest = test => {
			expect( test ).toBe( 'popularPlanBy' );
			return 'siteType';
		};

		test( 'chooses "personal" if the site type is "blog"', () => {
			const customerType = chooseDefaultCustomerType( {
				siteType: 'blog',
				abtest,
			} );

			expect( customerType ).toBe( 'personal' );
		} );

		test( 'chooses "personal" if the site type is "professional"', () => {
			const customerType = chooseDefaultCustomerType( {
				siteType: 'professional',
				abtest,
			} );

			expect( customerType ).toBe( 'personal' );
		} );

		test( 'chooses "business" if the site type is "business"', () => {
			const customerType = chooseDefaultCustomerType( {
				siteType: 'business',
				abtest,
			} );

			expect( customerType ).toBe( 'business' );
		} );

		test( 'chooses "business" if the site type is "online-store"', () => {
			const customerType = chooseDefaultCustomerType( {
				siteType: 'online-store',
				abtest,
			} );

			expect( customerType ).toBe( 'business' );
		} );
	} );
} );
