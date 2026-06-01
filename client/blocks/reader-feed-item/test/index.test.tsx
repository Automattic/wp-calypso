/**
 * @jest-environment jsdom
 */

import { useQuery } from '@tanstack/react-query';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderFeedItem from '../index';
import type { Reader } from '@automattic/data-stores';

const mockSubscribeMutate = jest.fn();
const mockUnsubscribeMutate = jest.fn();

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQuery: jest.fn(),
} ) );

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
} ) );

const mockUseQuery = jest.mocked( useQuery );

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

describe( 'ReaderFeedItem', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseQuery.mockReturnValue( {
			data: {
				description: 'Example description',
				name: 'Example Feed',
				subscription_id: undefined,
			},
			isLoading: false,
		} as ReturnType< typeof useQuery > );
	} );

	it( 'marks a feed as subscribed after a successful subscribe mutation', () => {
		mockSubscribeMutate.mockImplementation( ( _params, options ) => {
			options.onSuccess( {
				subscribed: true,
				subscription: {
					ID: '123',
				},
			} );
		} );

		renderWithProvider(
			<ReaderFeedItem feed={ makeFeedItem() } source="reader-new-subscription" />
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'Subscribe' } ) );

		expect( screen.getByRole( 'button', { name: 'Unsubscribe' } ) ).toBeVisible();
	} );

	it( 'does not invalidate site subscriptions when subscribed items are hidden', () => {
		mockSubscribeMutate.mockImplementation( () => {} );

		renderWithProvider(
			<ReaderFeedItem
				feed={ makeFeedItem() }
				source="reader-new-subscription"
				shouldHideOnSubscribedState
			/>
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'Subscribe' } ) );

		expect( mockSubscribeMutate ).toHaveBeenCalledWith(
			expect.objectContaining( {
				doNotInvalidateSiteSubscriptions: true,
			} ),
			expect.any( Object )
		);
	} );
} );
