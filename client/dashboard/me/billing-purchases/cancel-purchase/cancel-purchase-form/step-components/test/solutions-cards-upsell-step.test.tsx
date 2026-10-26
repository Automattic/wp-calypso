/**
 * @jest-environment jsdom
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../../../test-utils';
import SolutionsCardsUpsellStep from '../solutions-cards-upsell-step';
import type { Purchase } from '@automattic/api-core';

const mockSetNewMessagingChat = jest.fn();
const mockSetNavigateToRoute = jest.fn();
const mockSetShowHelpCenter = jest.fn();
const mockSetOpenOdieWithContext = jest.fn();

jest.mock( '../../../../../../app/help-center', () => ( {
	useHelpCenter: () => ( {
		setNewMessagingChat: mockSetNewMessagingChat,
		setNavigateToRoute: mockSetNavigateToRoute,
		setShowHelpCenter: mockSetShowHelpCenter,
		setOpenOdieWithContext: mockSetOpenOdieWithContext,
	} ),
} ) );

let mockCanConnectToZendesk = true;

jest.mock( '@automattic/zendesk-client', () => ( {
	useCanConnectToZendeskMessaging: () => ( { data: mockCanConnectToZendesk } ),
} ) );

const purchase = {
	ID: 123,
	blog_id: 456,
	site_slug: 'example.wordpress.com',
	product_slug: 'business-bundle',
	currency_code: 'USD',
	bill_period_days: 365,
} as Purchase;

const premiumAnnual = {
	...purchase,
	product_slug: 'value_bundle',
	is_plan: true,
	is_upgradable: true,
	is_plan_type_downgradable: true,
} as Purchase;

describe( '<SolutionsCardsUpsellStep />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockCanConnectToZendesk = true;
	} );

	test( 'speak-with-support calls setNewMessagingChat when Zendesk eligible', async () => {
		const user = userEvent.setup();
		const closeDialog = jest.fn();

		render(
			<SolutionsCardsUpsellStep
				cancellationReason="noLongerNeedSite"
				purchase={ purchase }
				closeDialog={ closeDialog }
				onDeclineUpsell={ jest.fn() }
			/>
		);

		const supportCard = await screen.findByRole( 'button', {
			name: /Speak with our support team/,
		} );
		await user.click( supportCard );

		expect( mockSetNewMessagingChat ).toHaveBeenCalledTimes( 1 );
		expect( mockSetNewMessagingChat ).toHaveBeenCalledWith(
			expect.objectContaining( {
				siteUrl: 'example.wordpress.com',
				siteId: '456',
			} )
		);
		expect( mockSetNavigateToRoute ).not.toHaveBeenCalledWith( '/odie' );
		expect( closeDialog ).not.toHaveBeenCalled();
	} );

	test.each( [
		[ 'noLongerNeedSite', 'business-bundle', 365, 'change-plan,speak-with-support' ],
		[
			'lackOfCustomization',
			'value_bundle',
			365,
			'change-plan,renew-now-pay-less,switch-to-monthly,speak-with-support',
		],
		[
			'lackOfCustomization',
			'business-bundle-monthly',
			30,
			'change-plan,renew-now-pay-less,speak-with-support',
		],
		[
			'coreFeaturesMissing',
			'personal-bundle',
			365,
			'change-plan,find-guides,ask-ai-assistant,speak-with-support',
		],
	] )(
		'fires view event on mount with visible card IDs %s %s',
		( cancellationReason, productSlug, billPeriodDays, solutionIds ) => {
			const recordEvent = jest.fn();

			render(
				<SolutionsCardsUpsellStep
					cancellationReason={ cancellationReason }
					purchase={
						{ ...purchase, product_slug: productSlug, bill_period_days: billPeriodDays } as Purchase
					}
					closeDialog={ jest.fn() }
					onDeclineUpsell={ jest.fn() }
					recordEvent={ recordEvent }
				/>
			);

			expect( recordEvent ).toHaveBeenCalledWith( 'calypso_cancellation_solution_cards_view', {
				solution_ids: solutionIds,
				cancellation_reason: cancellationReason,
			} );
			expect( recordEvent ).toHaveBeenCalledTimes( 1 );
		}
	);

	test( 'fires click event when a solution card is clicked', async () => {
		const user = userEvent.setup();
		const recordEvent = jest.fn();

		render(
			<SolutionsCardsUpsellStep
				cancellationReason="noLongerNeedSite"
				purchase={ purchase }
				closeDialog={ jest.fn() }
				onDeclineUpsell={ jest.fn() }
				recordEvent={ recordEvent }
			/>
		);

		const supportCard = await screen.findByRole( 'button', {
			name: /Speak with our support team/,
		} );
		await user.click( supportCard );

		expect( recordEvent ).toHaveBeenCalledWith( 'calypso_cancellation_solution_card_click', {
			solution_id: 'speak-with-support',
			cancellation_reason: 'noLongerNeedSite',
		} );
	} );

	test( 'does not throw when recordEvent is not provided', async () => {
		const user = userEvent.setup();

		render(
			<SolutionsCardsUpsellStep
				cancellationReason="noLongerNeedSite"
				purchase={ purchase }
				closeDialog={ jest.fn() }
				onDeclineUpsell={ jest.fn() }
			/>
		);

		const supportCard = await screen.findByRole( 'button', {
			name: /Speak with our support team/,
		} );
		await user.click( supportCard );

		// No error thrown — graceful degradation when recordEvent is omitted
		expect( mockSetNewMessagingChat ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'speak-with-support opens Odie fallback when not Zendesk eligible', async () => {
		mockCanConnectToZendesk = false;
		const user = userEvent.setup();
		const closeDialog = jest.fn();

		render(
			<SolutionsCardsUpsellStep
				cancellationReason="noLongerNeedSite"
				purchase={ purchase }
				closeDialog={ closeDialog }
				onDeclineUpsell={ jest.fn() }
			/>
		);

		const supportCard = await screen.findByRole( 'button', {
			name: /Speak with our support team/,
		} );
		await user.click( supportCard );

		expect( mockSetOpenOdieWithContext ).toHaveBeenCalledTimes( 1 );
		expect( mockSetOpenOdieWithContext ).toHaveBeenCalledWith(
			expect.objectContaining( {
				initialMessage: expect.stringContaining( 'Cancellation reason' ),
				siteUrl: 'example.wordpress.com',
				siteId: '456',
			} )
		);
		expect( mockSetNewMessagingChat ).not.toHaveBeenCalled();
		expect( closeDialog ).not.toHaveBeenCalled();
	} );

	test( 'renew card shows the 25% discount and links to checkout with the coupon', async () => {
		render(
			<SolutionsCardsUpsellStep
				cancellationReason="tooExpensive"
				purchase={ purchase }
				closeDialog={ jest.fn() }
				onDeclineUpsell={ jest.fn() }
			/>
		);

		const renewCard = await screen.findByRole( 'link', { name: /Renew now and pay less/ } );
		expect(
			within( renewCard ).getByText(
				'Get an exclusive 25% discount automatically applied at checkout.'
			)
		).toBeVisible();
		expect( renewCard ).toHaveAttribute(
			'href',
			expect.stringContaining( 'coupon=CANRENEW25OFF' )
		);
	} );

	test.each( [
		{
			card: 'Switch to a different plan',
			solutionId: 'change-plan',
			ref: 'cancel-flow-change-plan',
		},
		{
			card: 'Switch to monthly payments',
			solutionId: 'switch-to-monthly',
			ref: 'cancel-flow-switch-to-monthly',
		},
	] )( '$card opens the plans page and records the click', async ( { card, solutionId, ref } ) => {
		const user = userEvent.setup();
		const recordEvent = jest.fn();

		render(
			<SolutionsCardsUpsellStep
				cancellationReason="tooExpensive"
				purchase={ premiumAnnual }
				closeDialog={ jest.fn() }
				onDeclineUpsell={ jest.fn() }
				recordEvent={ recordEvent }
			/>
		);

		const link = await screen.findByRole( 'link', { name: new RegExp( card ) } );
		const href = link.getAttribute( 'href' ) as string;
		expect( new URL( href ).searchParams.get( 'ref' ) ).toBe( ref );

		// jsdom ignores navigation, so swap in a plain object to read the href the click sets.
		const originalLocation = window.location;
		Object.defineProperty( window, 'location', { value: { href: '' }, writable: true } );
		try {
			await user.click( link );

			expect( recordEvent ).toHaveBeenCalledWith( 'calypso_cancellation_solution_card_click', {
				solution_id: solutionId,
				cancellation_reason: 'tooExpensive',
			} );
			expect( window.location.href ).toBe( href );
		} finally {
			Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
		}
	} );

	test( 'Switch to a different plan still opens the plans page when the plan has no change link', async () => {
		const p2PlusMonthly = {
			...purchase,
			product_slug: 'wp_p2_plus_monthly',
			is_plan: true,
			is_upgradable: false,
			is_plan_type_downgradable: false,
			bill_period_days: 31,
		} as Purchase;

		render(
			<SolutionsCardsUpsellStep
				cancellationReason="tooExpensive"
				purchase={ p2PlusMonthly }
				closeDialog={ jest.fn() }
				onDeclineUpsell={ jest.fn() }
			/>
		);

		expect(
			await screen.findByRole( 'link', { name: /Switch to a different plan/ } )
		).toHaveAttribute( 'href', 'https://wordpress.com/plans/example.wordpress.com' );
	} );
} );
