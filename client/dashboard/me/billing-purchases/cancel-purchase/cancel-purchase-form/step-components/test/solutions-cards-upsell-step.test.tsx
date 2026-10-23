/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://my.localhost/me/billing/purchases/123/cancel?intent=remove"}
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../../../test-utils';
import { dashboardLink } from '../../../../../../utils/link';
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

async function getChangePlanHref() {
	const link = await screen.findByRole( 'link', { name: /Switch to a different plan/ } );
	expect( link ).toHaveAttribute( 'href' );
	return link.getAttribute( 'href' ) as string;
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
		expect( renewCard ).toHaveAttribute( 'href', expect.stringContaining( 'coupon=DONTGO25' ) );
	} );

	test( 'switch-to-monthly card on an annual plan is a button that calls onSwitchToMonthly and stays on the cards step', async () => {
		const user = userEvent.setup();
		const onSwitchToMonthly = jest.fn();

		render(
			<SolutionsCardsUpsellStep
				cancellationReason="tooExpensive"
				purchase={ purchase }
				closeDialog={ jest.fn() }
				onDeclineUpsell={ jest.fn() }
				onSwitchToMonthly={ onSwitchToMonthly }
			/>
		);

		const monthlyCard = await screen.findByRole( 'button', {
			name: /Switch to monthly payments/,
		} );
		await user.click( monthlyCard );

		expect( onSwitchToMonthly ).toHaveBeenCalledTimes( 1 );
		expect( monthlyCard ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'Switch to flexible monthly payments' } )
		).not.toBeInTheDocument();
	} );

	test( 'change-plan card links to the plans page with downgrades and the cancel-flow ref', async () => {
		render(
			<SolutionsCardsUpsellStep
				cancellationReason="tooExpensive"
				purchase={ premiumAnnual }
				closeDialog={ jest.fn() }
				onDeclineUpsell={ jest.fn() }
			/>
		);

		const url = new URL( await getChangePlanHref() );
		expect( url.pathname ).toBe( '/setup/plan-upgrade' );
		expect( url.searchParams.get( 'allow_downgrade' ) ).toBe( 'true' );
		expect( url.searchParams.get( 'ref' ) ).toBe( 'cancel-flow-change-plan' );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe(
			`${ dashboardLink( '/me/billing/purchases/:purchaseId' ) }?plan_changed=true`
		);
	} );

	test( 'clicking change-plan records the click and goes where the card links', async () => {
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
		const href = await getChangePlanHref();

		// jsdom ignores navigation, so swap in a plain object to read the href the click sets.
		const originalLocation = window.location;
		Object.defineProperty( window, 'location', { value: { href: '' }, writable: true } );
		try {
			await user.click( screen.getByRole( 'link', { name: /Switch to a different plan/ } ) );

			expect( recordEvent ).toHaveBeenCalledWith( 'calypso_cancellation_solution_card_click', {
				solution_id: 'change-plan',
				cancellation_reason: 'tooExpensive',
			} );
			expect( window.location.href ).toBe( href );
			expect( new URL( window.location.href ).searchParams.get( 'ref' ) ).toBe(
				'cancel-flow-change-plan'
			);
		} finally {
			Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
		}
	} );
} );
