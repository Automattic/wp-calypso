/**
 * @jest-environment jsdom
 */

import { disable, enable } from '@automattic/calypso-config';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../../test-utils';
import CancelPurchaseForm from '../index';
import {
	ATOMIC_REVERT_STEP,
	FEEDBACK_STEP,
	NEXT_ADVENTURE_STEP,
	REMOVE_PLAN_STEP,
	UPSELL_STEP,
} from '../steps';
import type { PlanProduct, Purchase } from '@automattic/api-core';

const mockNavigate = jest.fn();
jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useNavigate: () => mockNavigate,
} ) );

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
	onKeepSubscriptionClick: noop,
	onRadioOneChange: noop,
	onTextOneChange: noop,
};

const personalPlan = makePurchase( {
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	subscription_status: 'active',
	expiry_date: '2027-02-23T12:00:00+00:00',
} );

describe( '<CancelPurchaseForm />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

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

	test.each( [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ] )(
		'shows the survey title on %s',
		( surveyStep ) => {
			render(
				<CancelPurchaseForm
					{ ...defaultProps }
					surveyStep={ surveyStep }
					purchase={ makePurchase() }
				/>
			);

			expect(
				screen.getByRole( 'heading', { name: /answer a few quick questions/ } )
			).toBeVisible();
		}
	);

	test( 'shows only the remove plan copy on the remove plan step', () => {
		render(
			<CancelPurchaseForm
				{ ...defaultProps }
				surveyStep={ REMOVE_PLAN_STEP }
				allSteps={ [ REMOVE_PLAN_STEP ] }
				purchase={ personalPlan }
			/>
		);

		expect(
			screen.queryByRole( 'heading', { name: /answer a few quick questions/ } )
		).not.toBeInTheDocument();
		expect( screen.getByText( /If you remove your plan/ ) ).toBeVisible();
		expect( screen.getByText( /If you keep your plan/ ) ).toHaveTextContent(
			'until Feb 23, 2027.'
		);
	} );

	test( 'shows only the revert warning on the atomic revert step', () => {
		render(
			<CancelPurchaseForm
				{ ...defaultProps }
				surveyStep={ ATOMIC_REVERT_STEP }
				allSteps={ [ ATOMIC_REVERT_STEP ] }
				atomicTransfer={ { created_at: '2026-01-15T12:00:00+00:00' } }
				purchase={ makePurchase( { expiry_date: '2027-02-23T12:00:00+00:00' } ) }
			/>
		);

		expect(
			screen.queryByRole( 'heading', { name: /answer a few quick questions/ } )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'heading', { name: 'Proceed with caution' } ) ).toBeVisible();
	} );

	test( 'submits the removal from the Complete removal button on the remove plan step', async () => {
		const user = userEvent.setup();
		const onSubmit = jest.fn();
		render(
			<CancelPurchaseForm
				{ ...defaultProps }
				surveyStep={ REMOVE_PLAN_STEP }
				allSteps={ [ REMOVE_PLAN_STEP ] }
				purchase={ personalPlan }
				onSubmit={ onSubmit }
			/>
		);

		const removeButton = screen.getByRole( 'button', { name: 'Complete removal' } );
		expect( removeButton ).toBeEnabled();
		expect( screen.queryByRole( 'button', { name: 'Continue' } ) ).not.toBeInTheDocument();

		await user.click( removeButton );

		expect( onSubmit ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'returns to purchase settings when Keep plan is clicked on the remove plan step', async () => {
		const user = userEvent.setup();
		const onKeepSubscriptionClick = jest.fn();
		const onSubmit = jest.fn();
		render(
			<CancelPurchaseForm
				{ ...defaultProps }
				surveyStep={ REMOVE_PLAN_STEP }
				allSteps={ [ REMOVE_PLAN_STEP ] }
				purchase={ personalPlan }
				onKeepSubscriptionClick={ onKeepSubscriptionClick }
				onSubmit={ onSubmit }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Keep plan' } ) );

		expect( mockNavigate ).toHaveBeenCalledWith(
			expect.objectContaining( { params: { purchaseId: personalPlan.ID } } )
		);
		expect( onKeepSubscriptionClick ).toHaveBeenCalledTimes( 1 );
		expect( onSubmit ).not.toHaveBeenCalled();
	} );

	test( 'disables Keep plan while the removal is submitting on the remove plan step', () => {
		render(
			<CancelPurchaseForm
				{ ...defaultProps }
				surveyStep={ REMOVE_PLAN_STEP }
				allSteps={ [ REMOVE_PLAN_STEP ] }
				purchase={ personalPlan }
				isSubmitting
			/>
		);

		expect( screen.getByRole( 'button', { name: 'Keep plan' } ) ).toBeDisabled();
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

	describe( 'free month offer', () => {
		const freeMonthOfferText =
			'We get it – building a site takes time. But we’d love to see you stick around to build on what you started. How about a free month of your WordPress.com Business plan subscription to continue building your site?';

		function renderFreeMonthOffer( upsell = 'free-month-offer' ) {
			const freeMonthOfferClick = jest.fn();
			const recordEvent = jest.fn();

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
					solutionsReason="foundBetterValue"
					upsell={ upsell }
					freeMonthOfferClick={ freeMonthOfferClick }
					recordEvent={ recordEvent }
				/>
			);

			return { freeMonthOfferClick, recordEvent };
		}

		afterEach( () => {
			disable( 'purchases/cancel-options-cards' );
			disable( 'purchases/split-cancel-remove' );
		} );

		test( 'offers a free month on its own screen when the cards flag is off', async () => {
			const user = userEvent.setup();
			disable( 'purchases/cancel-options-cards' );
			const { freeMonthOfferClick } = renderFreeMonthOffer();

			expect( screen.getByRole( 'heading', { name: 'How about a free month?' } ) ).toBeVisible();
			expect( screen.getByText( freeMonthOfferText ) ).toBeVisible();

			await user.click( screen.getByRole( 'button', { name: 'Get a free month' } ) );

			expect( freeMonthOfferClick ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'offers a free month as the first card when the cards flag is on', async () => {
			const user = userEvent.setup();
			enable( 'purchases/cancel-options-cards' );
			const { freeMonthOfferClick, recordEvent } = renderFreeMonthOffer();

			const list = screen.getByRole( 'list', {
				name: 'Before canceling, you can consider these options:',
			} );
			const firstCard = within( within( list ).getAllByRole( 'listitem' )[ 0 ] );
			expect( firstCard.getByText( freeMonthOfferText ) ).toBeVisible();
			expect( recordEvent ).toHaveBeenCalledWith(
				'calypso_cancellation_solution_cards_view',
				expect.objectContaining( { solution_ids: expect.stringMatching( /^free-month-offer,/ ) } )
			);

			await user.click( firstCard.getByRole( 'button', { name: /^How about a free month\?/ } ) );

			expect( freeMonthOfferClick ).toHaveBeenCalledTimes( 1 );
			expect( recordEvent ).toHaveBeenCalledWith(
				'calypso_cancellation_solution_card_click',
				expect.objectContaining( { solution_id: 'free-month-offer' } )
			);
		} );

		test( 'leaves out the free month card for another upsell when the cards flag is on', () => {
			enable( 'purchases/cancel-options-cards' );
			renderFreeMonthOffer( 'built-by' );

			expect(
				screen.getByRole( 'list', { name: 'Before canceling, you can consider these options:' } )
			).toBeVisible();
			expect(
				screen.queryByRole( 'button', { name: /^How about a free month\?/ } )
			).not.toBeInTheDocument();
		} );
	} );
} );
