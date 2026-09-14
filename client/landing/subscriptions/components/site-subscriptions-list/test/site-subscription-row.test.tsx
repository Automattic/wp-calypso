/**
 * @jest-environment jsdom
 */

import {
	getSiteSubscriptionsQueryKey,
	type SiteSubscriptionsInfiniteData,
} from '@automattic/api-queries';
import { Reader } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from '../../subscription-manager-context';
import SiteSubscriptionRow from '../site-subscription-row';
import type { SiteSubscriptionItem } from '@automattic/api-core';
import type { ReactNode } from 'react';

const mockUnsubscribe = jest.fn();

jest.mock( '@automattic/components', () => ( {
	ExternalLink: ( { children, ...props }: { children: ReactNode } ) => (
		<a { ...props }>{ children }</a>
	),
	TimeSince: () => <span />,
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	Reader: {
		EmailDeliveryFrequency: {
			Instantly: 'instantly',
		},
		isValidId: ( id?: number | string | null ) => Number( id ) > 0,
	},
	SubscriptionManager: {
		useIsLoggedIn: () => ( { isLoggedIn: true } ),
		useSiteDeliveryFrequencyMutation: () => ( { mutate: jest.fn(), isPending: false } ),
		useSiteEmailMeNewCommentsMutation: () => ( { mutate: jest.fn(), isPending: false } ),
		useSiteEmailMeNewPostsMutation: () => ( { mutate: jest.fn(), isPending: false } ),
		useSiteNotifyMeOfNewPostsMutation: () => ( { mutate: jest.fn(), isPending: false } ),
		useSiteSubscribeMutation: () => ( { mutate: jest.fn(), isPending: false } ),
		useSiteUnsubscribeMutation: () => ( { mutate: mockUnsubscribe, isPending: false } ),
	},
} ) );

jest.mock( 'calypso/blocks/site-icon', () => ( {
	SiteIcon: () => <span />,
} ) );

jest.mock( 'calypso/data/reader/use-feed-recommendations-mutation', () => ( {
	useFeedRecommendationsMutation: () => ( { isRecommended: false, toggleRecommended: jest.fn() } ),
} ) );

jest.mock( 'calypso/landing/subscriptions/tracks', () => ( {
	SOURCE_SUBSCRIPTIONS_SITE_LIST: 'subscriptions-site-list',
	SOURCE_SUBSCRIPTIONS_UNSUBSCRIBED_NOTICE: 'subscriptions-unsubscribed-notice',
	useRecordCommentEmailsToggle: () => jest.fn(),
	useRecordNotificationsToggle: () => jest.fn(),
	useRecordPostEmailsSetFrequency: () => jest.fn(),
	useRecordPostEmailsToggle: () => jest.fn(),
	useRecordRecommendToggle: () => jest.fn(),
	useRecordSiteIconClicked: () => jest.fn(),
	useRecordSiteResubscribed: () => jest.fn(),
	useRecordSiteTitleClicked: () => jest.fn(),
	useRecordSiteUnsubscribed: () => jest.fn(),
	useRecordSiteUrlClicked: () => jest.fn(),
} ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserName: jest.fn( () => 'test-user' ),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	removeNotice: jest.fn( ( id ) => ( { type: 'REMOVE_NOTICE', id } ) ),
	successNotice: jest.fn( ( text, options ) => ( { type: 'SUCCESS_NOTICE', text, options } ) ),
} ) );

jest.mock( '../../settings', () => ( {
	SiteSettingsPopover: () => null,
} ) );

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeFollow = ( overrides: Partial< SiteSubscriptionItem > = {} ): SiteSubscriptionItem => ( {
	ID: 1,
	URL: 'https://example.com',
	feed_URL: 'https://example.com/feed',
	blog_ID: 123,
	comp_id: undefined,
	date_subscribed: new Date( '2024-01-01T00:00:00Z' ),
	delivery_methods: {
		email: {
			post_delivery_frequency: Reader.EmailDeliveryFrequency.Instantly,
			send_posts: true,
		},
		notification: {
			send_posts: true,
		},
	},
	feed_ID: 456,
	is_comp: false,
	is_following: true,
	is_owner: false,
	is_paid_subscription: false,
	is_rss: false,
	is_wpforteams_site: false,
	isDeleted: false,
	last_updated: new Date( '2024-01-02T00:00:00Z' ),
	meta: {
		links: {
			feed: 'https://example.com/feed',
			site: 'https://example.com',
		},
	},
	name: 'Example Site',
	organization_id: 0,
	resubscribed: false,
	site_icon: '',
	unseen_count: 0,
	...overrides,
} );

const seedSiteSubscriptionsCache = (
	queryClient: QueryClient,
	subscriptions: SiteSubscriptionItem[]
) => {
	queryClient.setQueryData< SiteSubscriptionsInfiniteData >( getSiteSubscriptionsQueryKey(), {
		pageParams: [ 1 ],
		pages: [
			{
				subscriptions,
				totalCount: subscriptions.length,
				page: 1,
				number: 200,
			},
		],
	} );
};

const getCachedFollow = ( queryClient: QueryClient ) =>
	queryClient.getQueryData< SiteSubscriptionsInfiniteData >( getSiteSubscriptionsQueryKey() )
		?.pages[ 0 ]?.subscriptions[ 0 ];

const makeSiteSubscription = (
	overrides: Partial< SiteSubscriptionItem > = {}
): SiteSubscriptionItem => ( {
	ID: '1',
	URL: 'https://example.com',
	blog_ID: '123',
	comp_id: undefined,
	date_subscribed: new Date( '2024-01-01T00:00:00Z' ),
	delivery_methods: {
		email: {
			post_delivery_frequency: Reader.EmailDeliveryFrequency.Instantly,
			send_posts: true,
		},
		notification: {
			send_posts: true,
		},
	},
	feed_ID: '456',
	feed_URL: 'https://example.com/feed',
	isDeleted: false,
	is_comp: false,
	is_following: true,
	is_owner: false,
	is_paid_subscription: false,
	is_rss: false,
	is_wpforteams_site: false,
	last_updated: new Date( '2024-01-02T00:00:00Z' ),
	meta: {
		links: {
			feed: 'https://example.com/feed',
			site: 'https://example.com',
		},
	},
	name: 'Example Site',
	organization_id: 0,
	resubscribed: false,
	site_icon: '',
	unseen_count: 0,
	...overrides,
} );

const renderRow = ( queryClient: QueryClient, overrides: Partial< SiteSubscriptionItem > = {} ) => {
	const store = createStore( ( state = {} ) => state );

	return render(
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Reader }>
					<SiteSubscriptionRow { ...makeSiteSubscription( overrides ) } />
				</SubscriptionManagerContextProvider>
			</QueryClientProvider>
		</Provider>
	);
};

describe( 'SiteSubscriptionRow', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUnsubscribe.mockImplementation( ( params ) => params.onSuccess?.() );
	} );

	it( 'updates the follows cache after unsubscribing', async () => {
		const user = userEvent.setup();
		const queryClient = makeQueryClient();
		seedSiteSubscriptionsCache( queryClient, [ makeFollow() ] );

		renderRow( queryClient );

		await user.click( screen.getByTitle( 'Unsubscribe' ) );

		expect( getCachedFollow( queryClient )?.is_following ).toBe( false );
	} );

	it( 'shows the delivery frequency in the email frequency column when email delivery is enabled', () => {
		const queryClient = makeQueryClient();

		renderRow( queryClient, {
			delivery_methods: {
				email: {
					post_delivery_frequency: Reader.EmailDeliveryFrequency.Instantly,
					send_posts: true,
				},
			},
		} );

		expect( screen.getByText( 'Instantly' ) ).toBeVisible();
	} );

	it( 'defaults the email frequency column to Instantly when enabled without a stored frequency', () => {
		const queryClient = makeQueryClient();

		renderRow( queryClient, {
			delivery_methods: {
				email: {
					send_posts: true,
				},
			},
		} );

		expect( screen.getByText( 'Instantly' ) ).toBeVisible();
	} );

	it( 'shows Paused in the email frequency column when email delivery is disabled', () => {
		const queryClient = makeQueryClient();

		renderRow( queryClient, {
			delivery_methods: {
				email: {
					post_delivery_frequency: Reader.EmailDeliveryFrequency.Instantly,
					send_posts: false,
				},
			},
		} );

		expect( screen.getByText( 'Paused' ) ).toBeVisible();
	} );
} );
