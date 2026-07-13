/**
 * @jest-environment jsdom
 */

import { SubscriptionManager } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import nock from 'nock';
import NotFoundSiteSubscriptions from '../not-found-site-subscriptions';

jest.mock( '@automattic/data-stores', () => {
	const actual = jest.requireActual( '@automattic/data-stores' );
	return {
		...actual,
		SubscriptionManager: {
			...actual.SubscriptionManager,
			useSiteSubscriptionsQuery: jest.fn(),
		},
	};
} );

const mockUseSiteSubscriptionsQuery = SubscriptionManager.useSiteSubscriptionsQuery as jest.Mock;

const Wrapper =
	( {
		searchTerm,
		subscriptions = [],
	}: {
		searchTerm: string;
		subscriptions?: Array< {
			feed_ID: string;
			URL: string;
			isDeleted?: boolean;
		} >;
	} ) =>
	( { children }: { children: React.ReactNode } ) => {
		mockUseSiteSubscriptionsQuery.mockReturnValue( {
			data: { subscriptions },
		} );

		return (
			<SubscriptionManager.SiteSubscriptionsQueryPropsProvider
				initialSearchTermState={ searchTerm }
			>
				<QueryClientProvider
					client={
						new QueryClient( {
							defaultOptions: {
								queries: { retry: false },
							},
						} )
					}
				>
					{ children }
				</QueryClientProvider>
			</SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
		);
	};

describe( 'NotFoundSiteSubscriptions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		nock.disableNetConnect();
	} );

	it( 'appends recommendation copy inline when feed search returns results', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.reply( 200, {
				feeds: [ { feed_ID: 1 }, { feed_ID: 2 } ],
			} );

		render( <NotFoundSiteSubscriptions />, {
			wrapper: Wrapper( { searchTerm: 'music' } ),
		} );

		expect(
			await screen.findByText(
				"You're not subscribed to any matching sites. Here are some other sites related to your search."
			)
		).toBeVisible();
	} );

	it( 'shows only the not-found sentence when feed search returns no results', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.reply( 200, {
				feeds: [],
			} );

		render( <NotFoundSiteSubscriptions />, {
			wrapper: Wrapper( { searchTerm: 'music' } ),
		} );

		expect(
			await screen.findByText( "You're not subscribed to any matching sites." )
		).toBeVisible();
		expect(
			screen.queryByText( 'Here are some other sites related to your search.' )
		).not.toBeInTheDocument();
	} );

	it( 'does not append recommendation copy when all feed results are already subscribed', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.reply( 200, {
				feeds: [
					{
						feed_ID: '123',
						subscribe_URL: 'https://already-subscribed.example.com/feed',
					},
				],
			} );

		render( <NotFoundSiteSubscriptions />, {
			wrapper: Wrapper( {
				searchTerm: 'music',
				subscriptions: [
					{
						feed_ID: '123',
						URL: 'https://already-subscribed.example.com/feed',
						isDeleted: false,
					},
				],
			} ),
		} );

		expect(
			await screen.findByText( "You're not subscribed to any matching sites." )
		).toBeVisible();
		expect(
			screen.queryByText( 'Here is one result related to your search.' )
		).not.toBeInTheDocument();
	} );
} );
