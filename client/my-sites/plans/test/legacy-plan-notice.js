import { shallow } from 'enzyme';
import legacyPlanNotice from 'calypso/my-sites/plans/legacy-plan-notice';

describe( 'Shows legacy plan notice for ex-plans', () => {
	test( 'Do not show legacy plan notice for sites on Free plan', () => {
		expect(
			legacyPlanNotice( true, { plan: { product_slug: 'free_plan', is_free: true } } )
		).toBeUndefined();
	} );

	test( 'Do not show legacy plan notice to sites on Business plan', () => {
		expect(
			legacyPlanNotice( true, { plan: { product_slug: 'business-bundle' } } )
		).toBeUndefined();
	} );

	test( 'Do not show legacy plan notice to sites on eCommerce plan', () => {
		expect(
			legacyPlanNotice( true, { plan: { product_slug: 'ecommerce-bundle' } } )
		).toBeUndefined();
	} );

	test( 'Do not show legacy plan notice to sites on Pro plan', () => {
		expect( legacyPlanNotice( true, { plan: { product_slug: 'pro-plan' } } ) ).toBeUndefined();
	} );

	test( 'Show legacy plan notice to sites on Blogger plan', () => {
		const wrapper = shallow(
			legacyPlanNotice( true, { plan: { product_slug: 'blogger-bundle' } } )
		);
		expect( wrapper.is( 'Notice' ) ).toBe( true );
	} );

	test( 'Show legacy plan notice to sites on Personal plan', () => {
		const wrapper = shallow(
			legacyPlanNotice( true, { plan: { product_slug: 'personal-bundle' } } )
		);
		expect( wrapper.is( 'Notice' ) ).toBe( true );
	} );

	test( 'Show legacy plan notice to sites on Premium plan', () => {
		const wrapper = shallow( legacyPlanNotice( true, { plan: { product_slug: 'value_bundle' } } ) );
		expect( wrapper.is( 'Notice' ) ).toBe( true );
	} );
} );
