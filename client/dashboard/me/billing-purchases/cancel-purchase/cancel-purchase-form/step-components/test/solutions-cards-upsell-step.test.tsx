/**
 * @jest-environment jsdom
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../../../test-utils';
import SolutionsCardsUpsellStep from '../solutions-cards-upsell-step';
import type { PlanProduct, Purchase } from '@automattic/api-core';

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

const monthlyBusinessPurchase = {
	...purchase,
	product_slug: 'business-bundle-monthly',
	bill_period_days: 31,
} as Purchase;

const monthlyPersonalPurchase = {
	...purchase,
	product_slug: 'personal-bundle-monthly',
	bill_period_days: 31,
} as Purchase;

const plans = [
	{ product_slug: 'personal-bundle-monthly', product_name: 'WordPress.com Personal' },
	{ product_slug: 'business-bundle-monthly', product_name: 'WordPress.com Business' },
] as PlanProduct[];

function getFirstCard() {
	const list = screen.getByRole( 'list', {
		name: 'Before canceling, you can consider these options:',
	} );
	return within( list ).getAllByRole( 'listitem' )[ 0 ];
}

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

	test( 'fires view event on mount with visible card IDs', () => {
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

		expect( recordEvent ).toHaveBeenCalledWith( 'calypso_cancellation_solution_cards_view', {
			solution_ids: 'change-plan,speak-with-support',
			cancellation_reason: 'noLongerNeedSite',
		} );
		expect( recordEvent ).toHaveBeenCalledTimes( 1 );
	} );

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

	test.each( [
		[
			'foundBetterValue',
			'free-month-offer,change-plan,renew-now-pay-less,switch-to-yearly,speak-with-support',
		],
		[
			'freeIsGoodEnough',
			'free-month-offer,change-plan,renew-now-pay-less,switch-to-yearly,speak-with-support',
		],
		[ 'complicatedDashboard', 'free-month-offer,built-by,ask-ai-assistant,speak-with-support' ],
		[ 'difficultEditor', 'free-month-offer,built-by,ask-ai-assistant,speak-with-support' ],
		[ 'tooMuchTimeToLearn', 'free-month-offer,built-by,ask-ai-assistant,speak-with-support' ],
		[ 'inadequateOnboarding', 'free-month-offer,built-by,ask-ai-assistant,speak-with-support' ],
	] )( 'shows the free month card first for %s', ( cancellationReason, solutionIds ) => {
		const recordEvent = jest.fn();

		render(
			<SolutionsCardsUpsellStep
				cancellationReason={ cancellationReason }
				plans={ plans }
				purchase={ monthlyBusinessPurchase }
				recordEvent={ recordEvent }
				showFreeMonthOffer
				yearlyPlanSlug="business-bundle"
			/>
		);

		expect( recordEvent ).toHaveBeenCalledWith( 'calypso_cancellation_solution_cards_view', {
			solution_ids: solutionIds,
			cancellation_reason: cancellationReason,
		} );
		expect(
			within( getFirstCard() ).getByRole( 'button', { name: /^How about a free month\?/ } )
		).toBeVisible();
	} );

	test.each( [
		[
			'foundBetterValue',
			'free-month-offer,renew-now-pay-less,switch-to-yearly,speak-with-support',
		],
		[ 'difficultEditor', 'free-month-offer,built-by,ask-ai-assistant,speak-with-support' ],
	] )(
		'shows the free month card first for %s on a Personal plan',
		( cancellationReason, solutionIds ) => {
			const recordEvent = jest.fn();

			render(
				<SolutionsCardsUpsellStep
					cancellationReason={ cancellationReason }
					plans={ plans }
					purchase={ monthlyPersonalPurchase }
					recordEvent={ recordEvent }
					showFreeMonthOffer
					yearlyPlanSlug="personal-bundle"
				/>
			);

			expect( recordEvent ).toHaveBeenCalledWith( 'calypso_cancellation_solution_cards_view', {
				solution_ids: solutionIds,
				cancellation_reason: cancellationReason,
			} );
			expect(
				within( getFirstCard() ).getByRole( 'button', { name: /^How about a free month\?/ } )
			).toBeVisible();
		}
	);

	test.each( [
		[
			undefined,
			'foundBetterValue',
			'change-plan,renew-now-pay-less,switch-to-yearly,speak-with-support',
		],
		[ undefined, 'difficultEditor', 'built-by,ask-ai-assistant,speak-with-support' ],
		[
			false,
			'foundBetterValue',
			'change-plan,renew-now-pay-less,switch-to-yearly,speak-with-support',
		],
		[ false, 'difficultEditor', 'built-by,ask-ai-assistant,speak-with-support' ],
	] )(
		'shows only the reason cards when showFreeMonthOffer is %s for %s',
		( showFreeMonthOffer, cancellationReason, solutionIds ) => {
			const recordEvent = jest.fn();

			render(
				<SolutionsCardsUpsellStep
					cancellationReason={ cancellationReason }
					plans={ plans }
					purchase={ monthlyBusinessPurchase }
					recordEvent={ recordEvent }
					showFreeMonthOffer={ showFreeMonthOffer }
					yearlyPlanSlug="business-bundle"
				/>
			);

			expect( recordEvent ).toHaveBeenCalledWith( 'calypso_cancellation_solution_cards_view', {
				solution_ids: solutionIds,
				cancellation_reason: cancellationReason,
			} );
			expect( screen.getByRole( 'button', { name: /Speak with our support team/ } ) ).toBeVisible();
			expect(
				screen.queryByRole( 'button', { name: /^How about a free month\?/ } )
			).not.toBeInTheDocument();
		}
	);

	test( 'shows the free month card title and text with the plan name', () => {
		render(
			<SolutionsCardsUpsellStep
				cancellationReason="foundBetterValue"
				plans={ plans }
				purchase={ monthlyBusinessPurchase }
				showFreeMonthOffer
				yearlyPlanSlug="business-bundle"
			/>
		);

		const card = within( getFirstCard() );
		expect(
			card.getByRole( 'button', { name: /^How about a free month\? We get it/ } )
		).toBeVisible();
		expect(
			card.getByText(
				'We get it – building a site takes time. But we’d love to see you stick around to build on what you started. How about a free month of your WordPress.com Business plan subscription to continue building your site?'
			)
		).toBeVisible();
	} );

	test( 'clicking the free month card records the click and calls onClickFreeMonthOffer', async () => {
		const user = userEvent.setup();
		const onClickFreeMonthOffer = jest.fn();
		const recordEvent = jest.fn();

		render(
			<SolutionsCardsUpsellStep
				cancellationReason="difficultEditor"
				onClickFreeMonthOffer={ onClickFreeMonthOffer }
				plans={ plans }
				purchase={ monthlyBusinessPurchase }
				recordEvent={ recordEvent }
				showFreeMonthOffer
				yearlyPlanSlug="business-bundle"
			/>
		);

		await user.click( screen.getByRole( 'button', { name: /^How about a free month\?/ } ) );

		expect( onClickFreeMonthOffer ).toHaveBeenCalledTimes( 1 );
		expect( recordEvent ).toHaveBeenCalledWith( 'calypso_cancellation_solution_card_click', {
			solution_id: 'free-month-offer',
			cancellation_reason: 'difficultEditor',
		} );
		expect( recordEvent ).toHaveBeenCalledWith( 'calypso_cancellation_solution_cards_view', {
			solution_ids: 'free-month-offer,built-by,ask-ai-assistant,speak-with-support',
			cancellation_reason: 'difficultEditor',
		} );
	} );

	test( 'disables the free month card while cancellation is in progress', async () => {
		const user = userEvent.setup();
		const onClickFreeMonthOffer = jest.fn();
		const recordEvent = jest.fn();

		render(
			<SolutionsCardsUpsellStep
				cancellationInProgress
				cancellationReason="difficultEditor"
				onClickFreeMonthOffer={ onClickFreeMonthOffer }
				plans={ plans }
				purchase={ monthlyBusinessPurchase }
				recordEvent={ recordEvent }
				showFreeMonthOffer
				yearlyPlanSlug="business-bundle"
			/>
		);

		const card = screen.getByRole( 'button', { name: /^How about a free month\?/ } );
		expect( card ).toHaveAttribute( 'aria-disabled', 'true' );

		await user.click( card );

		expect( recordEvent ).not.toHaveBeenCalledWith(
			'calypso_cancellation_solution_card_click',
			expect.anything()
		);
		expect( onClickFreeMonthOffer ).not.toHaveBeenCalled();
	} );
} );
