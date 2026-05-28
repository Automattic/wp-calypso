/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
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
} );
