/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from '../../../../../test-helpers/testing-library';
import SubscriberDetails from '../subscriber-details';

jest.mock( '../../../hooks', () => ( {
	useSubscriptionPlans: () => [
		{ title: 'Free', plan: 'Free Plan', is_free: true, is_complimentary: false },
	],
} ) );

const siteId = 1;

const initialState = {
	sites: { items: {} },
	ui: { selectedSiteId: siteId },
};

const baseSubscriber = {
	user_id: 123,
	subscription_id: 456,
	subscription_status: 'active',
	email_address: 'test@example.com',
	avatar: '',
	display_name: 'Test User',
	date_subscribed: '2026-01-01T00:00:00Z',
	plans: [],
};

function renderDetails( props = {} ) {
	return renderWithProvider(
		<SubscriberDetails subscriber={ baseSubscriber } siteId={ siteId } { ...props } />,
		{
			initialState,
			reducers: { ui: uiReducer },
		}
	);
}

describe( 'SubscriberDetails', () => {
	it( 'shows the comp button when onCompSubscription is provided', () => {
		renderDetails( { onCompSubscription: jest.fn() } );

		expect( screen.getByRole( 'button', { name: 'Comp a subscription' } ) ).toBeVisible();
	} );

	it( 'hides the comp button when onCompSubscription is undefined', () => {
		renderDetails();

		expect(
			screen.queryByRole( 'button', { name: 'Comp a subscription' } )
		).not.toBeInTheDocument();
	} );
} );
