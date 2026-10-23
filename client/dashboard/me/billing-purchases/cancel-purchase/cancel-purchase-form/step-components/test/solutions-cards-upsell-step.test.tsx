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

const CARD_TITLES: Record< string, string > = {
	'change-plan': 'Switch to a different plan',
	'renew-now-pay-less': 'Renew now and pay less',
	'switch-to-monthly': 'Switch to monthly payments',
	'find-guides': 'Find easy step-by-step guides',
	'ask-ai-assistant': 'Ask WordPress Agent',
	'speak-with-support': 'Speak with our support team',
};

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
			'lack of flexibility on an annual Premium plan',
			'lackOfCustomization',
			{ product_slug: 'value_bundle', bill_period_days: 365 },
			'change-plan,renew-now-pay-less,switch-to-monthly,speak-with-support',
		],
		[
			'lack of flexibility on an annual Personal plan',
			'lackOfCustomization',
			{ product_slug: 'personal-bundle', bill_period_days: 365 },
			'renew-now-pay-less,switch-to-monthly,speak-with-support',
		],
		[
			'lack of flexibility on a monthly Business plan',
			'lackOfCustomization',
			{ product_slug: 'business-bundle-monthly', bill_period_days: 30 },
			'change-plan,renew-now-pay-less,speak-with-support',
		],
		[
			'core features missing on an annual Personal plan',
			'coreFeaturesMissing',
			{ product_slug: 'personal-bundle', bill_period_days: 365 },
			'change-plan,find-guides,ask-ai-assistant,speak-with-support',
		],
		[
			'something else related to price/value',
			'otherPriceValue',
			{},
			'ask-ai-assistant,speak-with-support',
		],
	] )( 'shows the cards for %s', ( _, cancellationReason, overrides, solutionIds ) => {
		const recordEvent = jest.fn();

		render(
			<SolutionsCardsUpsellStep
				cancellationReason={ cancellationReason }
				purchase={ { ...purchase, ...overrides } as Purchase }
				closeDialog={ jest.fn() }
				onDeclineUpsell={ jest.fn() }
				recordEvent={ recordEvent }
				yearlyPlanSlug="business-bundle"
			/>
		);

		const titles = solutionIds.split( ',' ).map( ( id ) => CARD_TITLES[ id ] );
		const cards = within(
			screen.getByRole( 'list', { name: 'Before canceling, you can consider these options:' } )
		).getAllByRole( 'listitem' );
		expect( cards ).toHaveLength( titles.length );
		cards.forEach( ( card, index ) => expect( card ).toHaveTextContent( titles[ index ] ) );
		expect( recordEvent ).toHaveBeenCalledWith( 'calypso_cancellation_solution_cards_view', {
			solution_ids: solutionIds,
			cancellation_reason: cancellationReason,
		} );
		expect( recordEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'ask-ai-assistant opens the AI assistant with the answer for "Another reason"', async () => {
		const user = userEvent.setup();
		const closeDialog = jest.fn();
		const recordEvent = jest.fn();

		render(
			<SolutionsCardsUpsellStep
				cancellationReason="anotherReasonOne"
				purchase={ purchase }
				closeDialog={ closeDialog }
				onDeclineUpsell={ jest.fn() }
				recordEvent={ recordEvent }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: /Ask WordPress Agent/ } ) );

		expect( mockSetOpenOdieWithContext ).toHaveBeenCalledWith(
			expect.objectContaining( {
				section: 'pre-cancellation-upsell',
				initialMessage: expect.stringContaining( 'anotherReasonOne' ),
			} )
		);
		expect( closeDialog ).toHaveBeenCalledTimes( 1 );
		expect( recordEvent ).toHaveBeenCalledWith( 'calypso_cancellation_solution_card_click', {
			solution_id: 'ask-ai-assistant',
			cancellation_reason: 'anotherReasonOne',
		} );
	} );
} );
