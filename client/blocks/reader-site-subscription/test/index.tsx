/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ReaderSiteSubscription, {
	SiteSubscriptionContext,
	SiteSubscriptionContextProps,
} from '../index';

const queryClient = new QueryClient();
const mockStore = configureStore();

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
	render( <ReaderSiteSubscription />, {
		wrapper: ( props ) => {
			return (
				<Provider store={ store }>
					<QueryClientProvider client={ queryClient }>
						<SiteSubscriptionContext.Provider value={ siteSubscriptionContextValue }>
							{ props.children }
						</SiteSubscriptionContext.Provider>
					</QueryClientProvider>
				</Provider>
			);
		},
	} );
};

describe( 'ReaderSiteSubscription', () => {
	// Tests that the component renders with default props and no errors
	it( 'should render with default props and no errors', () => {
		const contextValue = {
			blogId: '123',
			data: {
				ID: 123,
				blog_ID: 123,
				name: 'Test Site',
				URL: 'https://example.com',
				site_icon: 'site_icon_url',
				date_subscribed: '2023-01-01',
				delivery_methods: {},
				subscriber_count: 100,
				payment_details: [],
			},
			isLoading: false,
			error: null,
			navigate: jest.fn(),
		};

		// Render the component
		renderReaderSiteSubscription( contextValue );

		// Assert that the back button is rendered
		expect(
			screen.getByRole( 'button', { name: 'Manage all subscriptions' } )
		).toBeInTheDocument();

		// Assert that the site subscription details are rendered
		expect( screen.getByRole( 'heading', { name: 'Test Site' } ) ).toBeInTheDocument();
		expect( screen.getByText( /100 subscribers/i ) ).toBeInTheDocument();
		expect( screen.getByText( 'Jan 1, 2023' ) ).toBeInTheDocument();
		expect( screen.getByAltText( 'Test Site' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Cancel subscription' } ) ).toBeEnabled();
	} );
} );
