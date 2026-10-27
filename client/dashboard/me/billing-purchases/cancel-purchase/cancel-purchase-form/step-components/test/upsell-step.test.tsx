/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../../../../test-utils';
import UpsellStep from '../upsell-step';
import type { PlanProduct, Purchase } from '@automattic/api-core';

const purchase = {
	site_slug: 'example.wordpress.com',
	is_plan: true,
	is_plan_type_downgradable: true,
} as Purchase;

const plans = [ { product_slug: 'personal-bundle', product_name: 'Personal' } ] as PlanProduct[];

describe( '<UpsellStep />', () => {
	test.each( [
		{
			upsell: 'downgrade-personal',
			accept: 'Switch to the Personal plan',
			ref: 'cancel-flow-downgrade-personal',
		},
	] )( '"$accept" is a link with ref=$ref', ( { upsell, accept, ref } ) => {
		render(
			<UpsellStep upsell={ upsell } purchase={ purchase } currencyCode="USD" plans={ plans } />
		);

		const url = new URL(
			screen.getByRole( 'link', { name: accept } ).getAttribute( 'href' ) as string
		);
		expect( url.searchParams.get( 'ref' ) ).toBe( ref );
	} );
} );
