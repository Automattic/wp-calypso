/**
 * @jest-environment jsdom
 */

import { disable, enable } from '@automattic/calypso-config';
import { screen, within } from '@testing-library/react';
import { render } from '../../../../../test-utils';
import CancelPurchaseForm from '../index';
import { FEEDBACK_STEP, NEXT_ADVENTURE_STEP, UPSELL_STEP } from '../steps';
import type { Purchase } from '@automattic/api-core';

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

	describe( 'option cards', () => {
		const premiumPurchase = makePurchase( {
			product_name: 'WordPress.com Premium',
			product_slug: 'value_bundle',
			bill_period_days: 365,
			currency_code: 'USD',
			site_slug: 'example.wordpress.com',
		} );
		const upsellStepProps = {
			...defaultProps,
			surveyStep: UPSELL_STEP,
			allSteps: [ FEEDBACK_STEP, UPSELL_STEP, NEXT_ADVENTURE_STEP ],
			purchase: premiumPurchase,
			clickNext: noop,
			onSubmit: noop,
		};
		const cardsListName = 'Before canceling, you can consider these options:';

		afterEach( () => {
			disable( 'purchases/cancel-options-cards' );
			disable( 'purchases/split-cancel-remove' );
		} );

		test( 'shows the cards for a reason that has them when the cards flag is on', () => {
			enable( 'purchases/cancel-options-cards' );

			render( <CancelPurchaseForm { ...upsellStepProps } questionOneText="noLongerNeedSite" /> );

			const cards = screen.getByRole( 'list', { name: cardsListName } );
			expect( within( cards ).getAllByRole( 'listitem' ) ).toHaveLength( 2 );
			expect(
				within( cards ).getByRole( 'link', { name: /Switch to a different plan/ } )
			).toBeVisible();
			expect(
				within( cards ).getByRole( 'button', { name: /Speak with our support team/ } )
			).toBeVisible();
		} );

		test( 'shows the cards instead of the Personal offer when the cards flag is on', () => {
			enable( 'purchases/cancel-options-cards' );

			render(
				<CancelPurchaseForm
					{ ...upsellStepProps }
					questionOneText="tooExpensive"
					upsell="downgrade-personal"
				/>
			);

			const cards = screen.getByRole( 'list', { name: cardsListName } );
			expect( within( cards ).getAllByRole( 'listitem' ) ).toHaveLength( 4 );
			expect(
				within( cards ).getByRole( 'link', { name: /Switch to a different plan/ } )
			).toBeVisible();
			expect(
				within( cards ).getByRole( 'link', { name: /Renew now and pay less/ } )
			).toBeVisible();
			expect(
				within( cards ).getByRole( 'button', { name: /Switch to monthly payments/ } )
			).toBeVisible();
			expect(
				within( cards ).getByRole( 'button', { name: /Speak with our support team/ } )
			).toBeVisible();
			expect(
				screen.queryByRole( 'heading', { name: 'Switch to a more affordable plan' } )
			).not.toBeInTheDocument();
		} );

		test( 'shows the Personal offer instead of the cards when the cards flag is off', () => {
			render(
				<CancelPurchaseForm
					{ ...upsellStepProps }
					questionOneText="tooExpensive"
					upsell="downgrade-personal"
				/>
			);

			expect(
				screen.getByRole( 'heading', { name: 'Switch to a more affordable plan' } )
			).toBeVisible();
			expect( screen.queryByRole( 'list', { name: cardsListName } ) ).not.toBeInTheDocument();
		} );

		test( 'keeps the Personal offer when only the split cancel/remove flag is on', () => {
			enable( 'purchases/split-cancel-remove' );

			render(
				<CancelPurchaseForm
					{ ...upsellStepProps }
					questionOneText="tooExpensive"
					upsell="downgrade-personal"
				/>
			);

			expect(
				screen.getByRole( 'heading', { name: 'Switch to a more affordable plan' } )
			).toBeVisible();
			expect( screen.queryByRole( 'list', { name: cardsListName } ) ).not.toBeInTheDocument();
		} );
	} );
} );
