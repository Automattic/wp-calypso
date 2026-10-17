/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../../test-utils';
import CancelPurchaseForm from '../index';
import { ATOMIC_REVERT_STEP, FEEDBACK_STEP, NEXT_ADVENTURE_STEP, REMOVE_PLAN_STEP } from '../steps';
import type { Purchase } from '@automattic/api-core';

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
} );
