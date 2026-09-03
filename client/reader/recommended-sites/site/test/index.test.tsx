/**
 * @jest-environment jsdom
 */
import { getReadSiteRecommendationsInfiniteQueryKey } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import RecommendedSite from '..';
import { seed as recommendedSitesSeed } from '../../constants';
import type { ReadSiteRecommendationsResponse } from '@automattic/api-core';
import type { InfiniteData } from '@tanstack/react-query';
import type { ComponentType, ReactElement } from 'react';

const BASE = 'https://public-api.wordpress.com';

jest.mock( 'calypso/blocks/site-icon', () => ( {
	SiteIcon: () => <span data-testid="site-icon" />,
} ) );

type MockConnectSiteProps = {
	feedId?: number;
	feed?: unknown;
	siteId?: number;
	site?: unknown;
};

jest.mock(
	'calypso/lib/reader-connect-site',
	() => ( Component: ComponentType< MockConnectSiteProps > ) => {
		return function MockConnectSite( props: MockConnectSiteProps ) {
			return (
				<Component
					{ ...props }
					site={ {
						ID: props.siteId,
						name: 'Example Site',
						title: 'Example Site',
						URL: 'https://example.com',
						description: 'Example description',
						icon: { img: 'https://example.com/icon.png' },
					} }
					feed={ {
						feed_ID: props.feedId,
						blog_ID: props.siteId,
						name: 'Example Site',
						URL: 'https://example.com',
						feed_URL: 'https://example.com/feed',
					} }
				/>
			);
		};
	}
);

jest.mock( 'calypso/landing/subscriptions/components/subscription-manager-context', () => ( {
	useSubscriptionManagerContext: () => ( { isReaderPortal: false } ),
} ) );

jest.mock( 'calypso/landing/subscriptions/tracks', () => ( {
	useRecordSiteIconClicked: () => jest.fn(),
	useRecordSiteTitleClicked: () => jest.fn(),
	useRecordSiteUrlClicked: () => jest.fn(),
	useRecordRecommendedSiteSubscribed: () => jest.fn(),
	useRecordRecommendedSiteDismissed: () => jest.fn(),
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTrainTracksRender: jest.fn(),
	recordTrainTracksInteract: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/ga', () => ( {
	gaRecordEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/mc', () => ( {
	bumpStat: jest.fn(),
} ) );

const makeStore = () => {
	const actions: unknown[] = [];
	const state = {};
	const store = createStore( ( currentState = state, action ) => {
		actions.push( action );
		return currentState;
	} );
	return { store, actions };
};

const railcar = {
	railcar: 'rail-1',
	fetch_algo: 'algo',
	fetch_lang: 'en',
	fetch_position: 0,
	rec_blog_id: '123',
};

const renderWithProviders = (
	ui: ReactElement,
	store: ReturnType< typeof makeStore >[ 'store' ],
	queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } )
) => {
	return {
		...render(
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>{ ui }</Provider>
			</QueryClientProvider>
		),
		queryClient,
	};
};

const recommendedSite = ( blogId: number, feedId: number ) => ( {
	algorithm: 'algo',
	blogId,
	description: 'Description',
	feedId,
	feedUrl: 'https://example.com/feed',
	icon: '',
	railcar,
	title: 'Example Site',
	url: 'https://example.com',
} );

const appendRecommendedSitesToCache = (
	queryClient: QueryClient,
	{ seed, number }: { seed: number; number: number },
	sites: ReturnType< typeof recommendedSite >[]
) => {
	const queryKey = getReadSiteRecommendationsInfiniteQueryKey( { seed, number } );
	queryClient.setQueryData< InfiniteData< ReadSiteRecommendationsResponse, number > >( queryKey, {
		pageParams: [ 0 ],
		pages: [
			{
				algorithm: sites[ 0 ]?.algorithm ?? '',
				sites: sites.map( ( site ) => ( {
					blog_id: site.blogId,
					blog_title: site.title,
					blog_url: site.url,
					description: site.description,
					feed_id: site.feedId,
					feed_url: site.feedUrl,
					icon: { img: site.icon },
					ID: site.blogId,
					name: site.title,
					railcar: site.railcar,
					URL: site.url,
				} ) ),
			},
		],
	} );
};

const getCachedRecommendedSiteIds = ( queryClient: QueryClient ) => {
	const data = queryClient.getQueryData< InfiniteData< ReadSiteRecommendationsResponse, number > >(
		getReadSiteRecommendationsInfiniteQueryKey( { seed: recommendedSitesSeed, number: 4 } )
	);
	return data?.pages.flatMap( ( page ) => page.sites.map( ( site ) => site.blog_id ) ) ?? [];
};

describe( 'RecommendedSite', () => {
	afterEach( () => nock.cleanAll() );

	it( 'dismisses the recommendation through React Query and removes it from the cache', async () => {
		const user = userEvent.setup();
		const scope = nock( BASE )
			.post( '/rest/v1.1/me/dismiss/sites/123/new' )
			.reply( 200, { success: true } );
		const { store, actions } = makeStore();
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		appendRecommendedSitesToCache( queryClient, { seed: recommendedSitesSeed, number: 4 }, [
			recommendedSite( 123, 456 ),
		] );

		renderWithProviders(
			<RecommendedSite siteId={ 123 } feedId={ 456 } railcar={ railcar } />,
			store,
			queryClient
		);

		await user.click( screen.getByTitle( 'Dismiss this recommendation' ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );

		await waitFor( () => expect( getCachedRecommendedSiteIds( queryClient ) ).toEqual( [] ) );
		expect( actions ).toContainEqual(
			expect.objectContaining( {
				notice: expect.objectContaining( {
					status: 'is-success',
				} ),
			} )
		);
	} );

	it( 'keeps the recommendation in the cache when dismissing fails', async () => {
		const user = userEvent.setup();
		nock( BASE ).post( '/rest/v1.1/me/dismiss/sites/123/new' ).reply( 500, {
			error: 'dismiss_failed',
		} );
		const { store, actions } = makeStore();
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		appendRecommendedSitesToCache( queryClient, { seed: recommendedSitesSeed, number: 4 }, [
			recommendedSite( 123, 456 ),
		] );

		renderWithProviders(
			<RecommendedSite siteId={ 123 } feedId={ 456 } railcar={ railcar } />,
			store,
			queryClient
		);

		await user.click( screen.getByTitle( 'Dismiss this recommendation' ) );

		await waitFor( () =>
			expect( actions ).toContainEqual(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-error',
					} ),
				} )
			)
		);
		expect( getCachedRecommendedSiteIds( queryClient ) ).toEqual( [ 123 ] );
	} );

	it( 'subscribes through React Query and removes the recommendation from the cache', async () => {
		const user = userEvent.setup();
		const scope = nock( BASE )
			.post( '/rest/v1.1/read/following/mine/new' )
			.reply( 200, {
				subscribed: true,
				subscription: {
					ID: '1',
					URL: 'https://example.com',
					feed_URL: 'https://example.com',
					blog_ID: '123',
					feed_ID: '456',
				},
			} );
		const { store, actions } = makeStore();
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		appendRecommendedSitesToCache( queryClient, { seed: recommendedSitesSeed, number: 4 }, [
			recommendedSite( 123, 456 ),
		] );

		renderWithProviders(
			<RecommendedSite siteId={ 123 } feedId={ 456 } railcar={ railcar } />,
			store,
			queryClient
		);

		await user.click( screen.getByRole( 'button', { name: 'Subscribe' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		await waitFor( () => expect( getCachedRecommendedSiteIds( queryClient ) ).toEqual( [] ) );
		expect( actions ).toContainEqual(
			expect.objectContaining( {
				notice: expect.objectContaining( {
					status: 'is-success',
				} ),
			} )
		);
	} );
} );
