/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
		[ 'downgrade-personal', 'Switch to a more affordable plan' ],
		[ 'downgrade-monthly', 'Switch to flexible monthly payments' ],
	] )( '%s shows the refund line for a refund over 0', ( upsell, title ) => {
		render(
			<UpsellStep
				upsell={ upsell }
				purchase={ purchase }
				currencyCode="USD"
				plans={ plans }
				refundAmount={ 12.34 }
			/>
		);

		expect( screen.getByRole( 'heading', { name: title } ) ).toBeVisible();
		expect( screen.getByText( /partial refund of \$12\.34/ ) ).toBeVisible();
	} );

	test.each( [
		[ 'downgrade-personal', 0, 'Switch to a more affordable plan' ],
		[ 'downgrade-personal', undefined, 'Switch to a more affordable plan' ],
		[ 'downgrade-monthly', 0, 'Switch to flexible monthly payments' ],
		[ 'downgrade-monthly', undefined, 'Switch to flexible monthly payments' ],
	] )( '%s hides the refund line when the refund is %s', ( upsell, refundAmount, title ) => {
		render(
			<UpsellStep
				upsell={ upsell }
				purchase={ purchase }
				currencyCode="USD"
				plans={ plans }
				refundAmount={ refundAmount }
			/>
		);

		expect( screen.getByRole( 'heading', { name: title } ) ).toBeVisible();
		expect( screen.queryByText( /refund/i ) ).not.toBeInTheDocument();
	} );

	test( 'downgrade-personal accept links to the plans page with the cancel-flow ref', async () => {
		const user = userEvent.setup();
		const onClickDowngrade = jest.fn();

		render(
			<UpsellStep
				upsell="downgrade-personal"
				purchase={ purchase }
				currencyCode="USD"
				plans={ plans }
				onClickDowngrade={ onClickDowngrade }
			/>
		);

		const link = screen.getByRole( 'link', { name: 'Switch to the Personal plan' } );
		const url = new URL( link.getAttribute( 'href' ) as string );
		expect( url.searchParams.get( 'ref' ) ).toBe( 'cancel-flow-downgrade-personal' );

		await user.click( link );

		expect( onClickDowngrade ).not.toHaveBeenCalled();
	} );

	test( 'downgrade-monthly accept calls onClickDowngrade', async () => {
		const user = userEvent.setup();
		const onClickDowngrade = jest.fn();

		render(
			<UpsellStep
				upsell="downgrade-monthly"
				purchase={ purchase }
				currencyCode="USD"
				plans={ plans }
				onClickDowngrade={ onClickDowngrade }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Switch to monthly payments' } ) );

		expect( onClickDowngrade ).toHaveBeenCalledTimes( 1 );
		expect( onClickDowngrade ).toHaveBeenCalledWith( 'downgrade-monthly' );
	} );
} );
