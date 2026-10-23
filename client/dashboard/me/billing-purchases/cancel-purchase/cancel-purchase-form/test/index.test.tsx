/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../../test-utils';
import CancelPurchaseForm from '../index';
import { FEEDBACK_STEP, NEXT_ADVENTURE_STEP, UPSELL_STEP } from '../steps';
import type { PlanProduct, Purchase } from '@automattic/api-core';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 123,
		product_name: 'WordPress.com Business',
		product_slug: 'business-bundle',
		is_plan: true,
		is_domain_registration: false,
		is_jetpack_plan_or_product: false,
		meta: '',
		domain: 'example.com',
		blog_id: 1,
		...overrides,
	} as Purchase;
}

const noop = () => {};
const defaultProps = {
	isVisible: true,
	intent: 'remove' as const,
	surveyStep: FEEDBACK_STEP,
	allSteps: [ FEEDBACK_STEP ],
	plans: [],
	siteSlug: 'example.com',
	questionOneOrder: [],
	offerDiscountBasedFromPurchasePrice: 0,
	atomicRevertOnClickCheckOne: noop,
	atomicRevertOnClickCheckTwo: noop,
	onGetCancellationOffer: noop,
	onImportRadioChange: noop,
	onRadioOneChange: noop,
	onTextOneChange: noop,
};

describe( '<CancelPurchaseForm />', () => {
	test( 'asks for a cancellation reason for a Google Workspace purchase', () => {
		render(
			<CancelPurchaseForm
				{ ...defaultProps }
				allSteps={ [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ] }
				purchase={ makePurchase( {
					product_name: 'Google Workspace Business Starter',
					product_slug: 'wp_google_workspace_business_starter_yearly',
					is_plan: false,
					is_google_workspace_product: true,
					meta: 'example.com',
				} ) }
				questionOneOrder={ [ 'doNotNeedIt', 'purchasedByMistake' ] }
			/>
		);

		expect( screen.getByRole( 'radio', { name: 'I purchased it by mistake.' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Continue removal' } ) ).toBeDisabled();
	} );

	test( 'enables the next step once a Google Workspace reason is selected', () => {
		render(
			<CancelPurchaseForm
				{ ...defaultProps }
				allSteps={ [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ] }
				purchase={ makePurchase( {
					product_name: 'Google Workspace Business Starter',
					product_slug: 'wp_google_workspace_business_starter_yearly',
					is_plan: false,
					is_google_workspace_product: true,
					meta: 'example.com',
				} ) }
				questionOneOrder={ [ 'doNotNeedIt', 'purchasedByMistake' ] }
				questionOneRadio="purchasedByMistake"
			/>
		);

		expect( screen.getByRole( 'button', { name: 'Continue removal' } ) ).toBeEnabled();
	} );

	test( 'does not block the removal when the step has no question to answer', () => {
		render(
			<CancelPurchaseForm
				{ ...defaultProps }
				purchase={ makePurchase( {
					product_name: 'Jetpack VaultPress Backup',
					product_slug: 'jetpack_backup_t1_yearly',
					is_plan: false,
					is_jetpack_plan_or_product: true,
				} ) }
			/>
		);

		expect( screen.queryByRole( 'radio' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Complete removal' } ) ).toBeEnabled();
	} );

	test( 'offers a free month of the current plan', async () => {
		const user = userEvent.setup();
		const freeMonthOfferClick = jest.fn();

		render(
			<CancelPurchaseForm
				{ ...defaultProps }
				surveyStep={ UPSELL_STEP }
				allSteps={ [ FEEDBACK_STEP, UPSELL_STEP ] }
				purchase={ makePurchase( {
					product_name: 'Business',
					product_slug: 'business-bundle-monthly',
					bill_period_days: 31,
				} ) }
				plans={ [
					{
						product_slug: 'business-bundle-monthly',
						product_name: 'WordPress.com Business',
					} as PlanProduct,
				] }
				questionOneText="foundBetterValue"
				upsell="free-month-offer"
				freeMonthOfferClick={ freeMonthOfferClick }
			/>
		);

		expect( screen.getByRole( 'heading', { name: 'How about a free month?' } ) ).toBeVisible();
		expect(
			screen.getByText(
				'We get it – building a site takes time. But we’d love to see you stick around to build on what you started. How about a free month of your WordPress.com Business plan subscription to continue building your site?'
			)
		).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Get a free month' } ) );

		expect( freeMonthOfferClick ).toHaveBeenCalledTimes( 1 );
	} );
} );
