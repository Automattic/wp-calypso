/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import legacyPlanNotice from 'calypso/my-sites/plans/legacy-plan-notice';

describe( 'Shows legacy plan notice for ex-plans', () => {
	test( 'Do not show legacy plan notice for sites on Free plan', () => {
		const { container } = render(
			legacyPlanNotice( true, { plan: { product_slug: 'free_plan', is_free: true } } )
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'Do not show legacy plan notice to sites on Business plan', () => {
		const { container } = render(
			legacyPlanNotice( true, { plan: { product_slug: 'business-bundle' } } )
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'Do not show legacy plan notice to sites on eCommerce plan', () => {
		const { container } = render(
			legacyPlanNotice( true, { plan: { product_slug: 'ecommerce-bundle' } } )
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'Do not show legacy plan notice to sites on Pro plan', () => {
		const { container } = render(
			legacyPlanNotice( true, { plan: { product_slug: 'pro-plan' } } )
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'Show legacy plan notice to sites on Blogger plan', () => {
		render( legacyPlanNotice( true, { plan: { product_slug: 'blogger-bundle' } } ) );
		expect( screen.queryByRole( 'status' ) ).toBeInTheDocument();
	} );

	test( 'Show legacy plan notice to sites on Personal plan', () => {
		render( legacyPlanNotice( true, { plan: { product_slug: 'personal-bundle' } } ) );
		expect( screen.queryByRole( 'status' ) ).toBeInTheDocument();
	} );

	test( 'Show legacy plan notice to sites on Premium plan', () => {
		render( legacyPlanNotice( true, { plan: { product_slug: 'value_bundle' } } ) );
		expect( screen.queryByRole( 'status' ) ).toBeInTheDocument();
	} );
} );
