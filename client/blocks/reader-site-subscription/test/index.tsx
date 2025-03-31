/**
 * @jest-environment jsdom
 */
import { Reader } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import ReaderSiteSubscription, {
	SiteSubscriptionContext,
	SiteSubscriptionContextProps,
} from '../index';

const queryClient = new QueryClient();
const mockStore = configureStore();

const mockSiteSubscriptionContext = (
	subscription: Partial< Reader.SiteSubscriptionDetails< string > > = {}
): SiteSubscriptionContextProps => {
	return {
		data: {
			ID: 123,
			blog_ID: 123,
			feed_ID: 987123654,
			name: 'Test Site',
			URL: 'https://example.com',
			site_icon: 'site_icon_url',
			date_subscribed: '2023-01-01',
			delivery_methods: {},
			subscriber_count: 100,
			payment_details: [],
			...subscription,
		},
		isLoading: false,
		error: null,
		navigate: jest.fn(),
	};
};

const renderReaderSiteSubscription = (
	siteSubscriptionContextValue: SiteSubscriptionContextProps,
	storeValue = {
		ui: {
			selectedSiteId: 123,
		},
		sites: { items: [] },
		siteSettings: { items: [] },
	}
) => {
	const store = mockStore( storeValue );
	act( () => {
		render( <ReaderSiteSubscription />, {
			wrapper: ( props ) => {
				return (
					<Provider store={ store }>
						<QueryClientProvider client={ queryClient }>
							<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Reader }>
								<SiteSubscriptionContext.Provider value={ siteSubscriptionContextValue }>
									{ props.children }
								</SiteSubscriptionContext.Provider>
							</SubscriptionManagerContextProvider>
						</QueryClientProvider>
					</Provider>
				);
			},
		} );
	} );
};

describe( 'ReaderSiteSubscription', () => {
	// Tests that the component renders with default props and no errors
	it( 'should render with default props and no errors', () => {
		const date = Intl.DateTimeFormat( undefined, { dateStyle: 'medium' } ).format(
			new Date( '2023-01-01' )
		);

		// Render the component
		renderReaderSiteSubscription( mockSiteSubscriptionContext() );

		// Assert that the back button is rendered
		expect( screen.getByRole( 'button', { name: 'Back' } ) ).toBeInTheDocument();

		// Assert that the site subscription details are rendered
		expect( screen.getAllByTitle( 'View feed' )[ 0 ] ).toBeInTheDocument();
		expect( screen.getByText( /100 subscribers/i ) ).toBeInTheDocument();
		expect( screen.getByText( date ) ).toBeInTheDocument();
		expect( screen.getByAltText( 'Test Site' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Unsubscribe' } ) ).toBeEnabled();
	} );

	it( 'The "View feed" button should navigate to the expected path', async () => {
		renderReaderSiteSubscription( mockSiteSubscriptionContext( { feed_ID: 123456789 } ) );

		expect( screen.getAllByTitle( 'View feed' )[ 0 ] ).toHaveAttribute(
			'href',
			'/reader/feeds/123456789'
		);
	} );
} );
