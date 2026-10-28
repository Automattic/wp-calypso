/**
 * @jest-environment jsdom
 */

import { disable, enable } from '@automattic/calypso-config';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../../test-utils';
import CancelPurchaseForm from '../index';
import { ATOMIC_REVERT_STEP, FEEDBACK_STEP, NEXT_ADVENTURE_STEP, UPSELL_STEP } from '../steps';
import type { Purchase } from '@automattic/api-core';
import type { ComponentProps } from 'react';

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
		const cardsListName = 'Before canceling, you can consider these options:';

		afterEach( () => {
			disable( 'purchases/cancel-options-cards' );
			disable( 'purchases/split-cancel-remove' );
		} );

		test( 'shows the cards for a reason that has them when the cards flag is on', () => {
			enable( 'purchases/cancel-options-cards' );

			render(
				<CancelPurchaseForm
					{ ...upsellStepProps }
					questionOneText="noLongerNeedSite"
					solutionsReason="noLongerNeedSite"
				/>
			);

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
					solutionsReason="tooExpensive"
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
					solutionsReason="tooExpensive"
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
					solutionsReason="tooExpensive"
					upsell="downgrade-personal"
				/>
			);

			expect(
				screen.getByRole( 'heading', { name: 'Switch to a more affordable plan' } )
			).toBeVisible();
			expect( screen.queryByRole( 'list', { name: cardsListName } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'offer clicks', () => {
		test( 'adds the purchase ID to the built-by click', async () => {
			const user = userEvent.setup();
			const { recordTracksEvent } = render(
				<CancelPurchaseForm { ...upsellStepProps } upsell="built-by" />
			);

			await user.click( screen.getByRole( 'button', { name: 'Get help building my site' } ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_cancellation_upsell_step_buily_by_click',
				{ purchase_id: 123 }
			);
		} );

		test( 'adds the purchase ID to the upgrade click', async () => {
			const user = userEvent.setup();
			const { recordTracksEvent } = render(
				<CancelPurchaseForm { ...upsellStepProps } upsell="upgrade-atomic" />
			);

			await user.click( screen.getByRole( 'link', { name: /I want the/ } ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_cancellation_upgrade_at_step_upgrade_click',
				{ purchase_id: 123 }
			);
		} );

		test( 'adds the purchase ID to the live chat click and keeps its type', async () => {
			const user = userEvent.setup();
			const { recordTracksEvent } = render(
				<CancelPurchaseForm { ...upsellStepProps } upsell="live-chat:plans" />
			);

			await user.click(
				screen.getByRole( 'button', { name: 'Connect with a Happiness Engineer' } )
			);

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_cancellation_upsell_step_live_chat_click',
				{ type: 'live-chat:plans', purchase_id: 123 }
			);
		} );
	} );

	describe( 'exposure event', () => {
		const EXPOSURE = 'calypso_purchases_cancel_options_eligible';

		function renderReasonStep(
			props: Partial< ComponentProps< typeof CancelPurchaseForm > > = {}
		) {
			const recordEvent = jest.fn();
			const clickNext = jest.fn();
			const onSubmit = jest.fn();
			const result = render(
				<CancelPurchaseForm
					{ ...defaultProps }
					allSteps={ [ FEEDBACK_STEP, UPSELL_STEP, NEXT_ADVENTURE_STEP ] }
					purchase={ makePurchase() }
					questionOneRadio="price/budget"
					questionOneText="tooExpensive"
					solutionsReason="tooExpensive"
					recordEvent={ recordEvent }
					clickNext={ clickNext }
					onSubmit={ onSubmit }
					{ ...props }
				/>
			);
			return { ...result, recordEvent, clickNext, onSubmit };
		}

		test( 'records the exposure before leaving the reason step', async () => {
			const user = userEvent.setup();
			const { recordEvent, clickNext } = renderReasonStep();

			await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );

			expect( recordEvent ).toHaveBeenCalledTimes( 1 );
			expect( recordEvent ).toHaveBeenCalledWith( EXPOSURE, {
				purchase_id: 123,
				cancellation_reason: 'tooExpensive',
			} );
			expect( clickNext ).toHaveBeenCalledTimes( 1 );
			expect( recordEvent.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
				clickNext.mock.invocationCallOrder[ 0 ]
			);
		} );

		test( 'records the exposure from "Continue"', async () => {
			const user = userEvent.setup();
			const { recordEvent, clickNext } = renderReasonStep( {
				intent: 'cancel',
				questionOneRadio: 'wrongPlanOrSite',
				questionOneText: 'wrongPlan',
				solutionsReason: 'wrongPlan',
			} );

			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			expect( clickNext ).toHaveBeenCalledTimes( 1 );
			expect( recordEvent ).toHaveBeenCalledTimes( 1 );
			expect( recordEvent ).toHaveBeenCalledWith( EXPOSURE, {
				purchase_id: 123,
				cancellation_reason: 'wrongPlan',
			} );
		} );

		test( 'skips the exposure when "Continue" leaves question two', async () => {
			const user = userEvent.setup();
			// An Atomic revert step after question two gives question two a "Continue" button.
			const { recordEvent, clickNext } = renderReasonStep( {
				intent: 'cancel',
				allSteps: [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP, ATOMIC_REVERT_STEP ],
				surveyStep: NEXT_ADVENTURE_STEP,
				isNextAdventureValid: true,
			} );

			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			expect( clickNext ).toHaveBeenCalledTimes( 1 );
			expect( recordEvent ).not.toHaveBeenCalled();
		} );

		test( 'records "Another reason" as the exposure reason with text typed', async () => {
			const user = userEvent.setup();
			const { recordEvent } = renderReasonStep( {
				questionOneRadio: 'anotherReasonOne',
				questionOneText: 'test reason',
				solutionsReason: 'anotherReasonOne',
			} );

			await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );

			expect( recordEvent ).toHaveBeenCalledTimes( 1 );
			expect( recordEvent ).toHaveBeenCalledWith( EXPOSURE, {
				purchase_id: 123,
				cancellation_reason: 'anotherReasonOne',
			} );
		} );

		test.each( [
			[ 'a reason without options', 'technicalIssues', 'pluginOrThemeConflicts' ],
			[
				'"Something else related to changed needs" with text typed',
				'noLongerNeedSite',
				'test reason',
			],
		] )( 'skips the exposure for %s', async ( _, questionOneRadio, solutionsReason ) => {
			const user = userEvent.setup();
			const { recordEvent, clickNext } = renderReasonStep( {
				questionOneRadio,
				questionOneText: solutionsReason,
				solutionsReason,
			} );

			await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );

			expect( clickNext ).toHaveBeenCalledTimes( 1 );
			expect( recordEvent ).not.toHaveBeenCalled();
		} );

		test( 'skips the exposure when the survey is skipped', async () => {
			const user = userEvent.setup();
			const { recordEvent, onSubmit } = renderReasonStep( { intent: 'cancel' } );

			await user.click( screen.getByRole( 'button', { name: 'Skip survey' } ) );

			expect( onSubmit ).toHaveBeenCalledTimes( 1 );
			expect( recordEvent ).not.toHaveBeenCalled();
		} );

		test.each( [
			[ 'a product other than a plan', { is_plan: false } ],
			[ 'a Jetpack plan', { is_jetpack_plan_or_product: true } ],
		] )( 'skips the exposure for %s', async ( _, overrides ) => {
			const user = userEvent.setup();
			const { recordEvent, clickNext } = renderReasonStep( {
				purchase: makePurchase( overrides ),
			} );

			await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );

			expect( clickNext ).toHaveBeenCalledTimes( 1 );
			expect( recordEvent ).not.toHaveBeenCalled();
		} );

		test( 'skips the exposure on mount and remount', () => {
			const first = renderReasonStep();
			first.unmount();
			const second = renderReasonStep();

			expect( screen.getByRole( 'button', { name: 'Continue removal' } ) ).toBeEnabled();
			expect( first.recordEvent ).not.toHaveBeenCalled();
			expect( second.recordEvent ).not.toHaveBeenCalled();
		} );
	} );
} );
