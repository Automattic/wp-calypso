/**
 * @jest-environment jsdom
 */

import {
	getSiteSubscriptionsQueryKey,
	readFeedQuery,
	readSiteQuery,
} from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderFeedItem from '../index';
import type { Reader } from '@automattic/data-stores';

const mockSubscribeMutate = jest.fn();
const mockUnsubscribeMutate = jest.fn();

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTrainTracksInteract: jest.fn(),
	recordTrainTracksRender: jest.fn(),
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	Reader: {},
	SubscriptionManager: {
		useSiteSubscribeMutation: () => ( {
			isPending: false,
			mutate: mockSubscribeMutate,
		} ),
		useSiteUnsubscribeMutation: () => ( {
			isPending: false,
			mutate: mockUnsubscribeMutate,
		} ),
	},
} ) );

jest.mock( 'calypso/landing/subscriptions/tracks', () => ( {
	SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST: 'subscriptions-search-recommendation-list',
	useRecordSiteIconClicked: () => jest.fn(),
	useRecordSiteSubscribed: () => jest.fn(),
	useRecordSiteTitleClicked: () => jest.fn(),
	useRecordSiteUnsubscribed: () => jest.fn(),
	useRecordSiteUrlClicked: () => jest.fn(),
} ) );

jest.mock( 'calypso/blocks/site-icon', () => ( {
	SiteIcon: () => <div data-testid="site-icon" />,
} ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isCurrentUserEmailVerified: jest.fn( () => true ),
	isUserLoggedIn: jest.fn( () => true ),
} ) );

const makeFeedItem = ( overrides: Partial< Reader.FeedItem > = {} ): Reader.FeedItem => ( {
	ID: '10',
	URL: 'https://example.com',
	blog_ID: '',
	description: 'Example description',
	feed_ID: '10',
	feed_URL: 'https://example.com/feed',
	image: '',
	is_following: false,
	last_checked: '',
	last_update: '',
	marked_for_refresh: false,
	meta: {},
	name: 'Example Feed',
	next_refresh_time: null,
	organization_id: 0,
	subscribe_URL: 'https://example.com/feed',
	subscribers_count: 0,
	unseen_count: 0,
	...overrides,
} );

const makeQueryClient = ( siteSubscriptions: unknown[] = [] ) => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( readFeedQuery( 10 ).queryKey, {
		description: 'Example description',
		image: '',
		name: 'Example Feed',
		subscription_id: undefined,
	} );
	queryClient.setQueryData( getSiteSubscriptionsQueryKey(), {
		pages: [
			{
				subscriptions: siteSubscriptions,
				totalCount: siteSubscriptions.length,
				page: 1,
				number: 100,
			},
		],
		pageParams: [ 1 ],
	} );
	return queryClient;
};

describe( 'ReaderFeedItem', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'marks a feed as subscribed after a successful subscribe mutation', async () => {
		const user = userEvent.setup();
		mockSubscribeMutate.mockImplementation( ( _params, options ) => {
			options.onSuccess( {
				subscribed: true,
				subscription: {
					ID: '123',
				},
			} );
		} );

		renderWithProvider(
			<ReaderFeedItem feed={ makeFeedItem() } source="reader-new-subscription" />,
			{ queryClient: makeQueryClient() }
		);

		await user.click( screen.getByRole( 'button', { name: 'Subscribe' } ) );

		expect( screen.getByRole( 'button', { name: 'Unsubscribe' } ) ).toBeVisible();
	} );

	it( 'does not invalidate site subscriptions when subscribed items are hidden', async () => {
		const user = userEvent.setup();
		mockSubscribeMutate.mockImplementation( () => {} );

		renderWithProvider(
			<ReaderFeedItem
				feed={ makeFeedItem() }
				source="reader-new-subscription"
				shouldHideOnSubscribedState
			/>,
			{ queryClient: makeQueryClient() }
		);

		await user.click( screen.getByRole( 'button', { name: 'Subscribe' } ) );

		expect( mockSubscribeMutate ).toHaveBeenCalledWith(
			expect.objectContaining( {
				doNotInvalidateSiteSubscriptions: true,
			} ),
			expect.any( Object )
		);
	} );

	it( 'shows Unsubscribe when site subscriptions cache already marks the feed as followed', () => {
		const queryClient = makeQueryClient( [
			{
				ID: 55,
				blog_ID: 99,
				feed_ID: 10,
				URL: 'https://example.wordpress.com',
				feed_URL: 'https://example.wordpress.com',
				is_following: true,
				isDeleted: false,
			},
		] );
		queryClient.setQueryData( readSiteQuery( 99 ).queryKey, {
			ID: 99,
			name: 'Example Site',
			description: 'Example description',
			URL: 'https://example.wordpress.com',
			icon: {},
		} );

		renderWithProvider(
			<ReaderFeedItem
				feed={ makeFeedItem( {
					blog_ID: '99',
					feed_ID: '10',
					subscribe_URL: 'https://example.wordpress.com',
				} ) }
				source="reader-new-subscription"
			/>,
			{ queryClient }
		);

		expect( screen.getByRole( 'button', { name: 'Unsubscribe' } ) ).toBeVisible();
	} );

	it( 'unsubscribes using the cache subscription id when only the feed URL matches', async () => {
		const user = userEvent.setup();
		// feed_ID on the result differs from the followed row; URL still matches.
		const queryClient = makeQueryClient( [
			{
				ID: 55,
				blog_ID: null,
				feed_ID: 888,
				URL: 'https://example.com/feed',
				feed_URL: 'https://example.com/feed',
				is_following: true,
				isDeleted: false,
			},
		] );

		renderWithProvider(
			<ReaderFeedItem
				feed={ makeFeedItem( {
					blog_ID: '',
					feed_ID: '10',
					subscribe_URL: 'https://example.com/feed',
				} ) }
				source="reader-new-subscription"
			/>,
			{ queryClient }
		);

		await user.click( screen.getByRole( 'button', { name: 'Unsubscribe' } ) );

		expect( mockUnsubscribeMutate ).toHaveBeenCalledWith(
			expect.objectContaining( {
				subscriptionId: 55,
				feed_id: '10',
				url: 'https://example.com/feed',
			} )
		);
	} );
} );
