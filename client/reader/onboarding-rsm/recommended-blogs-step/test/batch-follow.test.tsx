/**
 * @jest-environment jsdom
 */

import { getSiteSubscriptionsQueryKey } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { RecommendedBlogsStep } from '../index';
import type { SiteSubscriptionsInfiniteData } from '@automattic/api-queries';
import type {
	RecommendedBlog,
	RecommendedBlogGroup,
} from 'calypso/reader/onboarding-rsm/recommended-blogs';

const API = 'https://public-api.wordpress.com';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/reader/data/tags', () => ( {
	useFollowedTags: () => ( { data: [ { slug: 'food' } ], isLoading: false } ),
} ) );

jest.mock( 'calypso/reader/onboarding-rsm/recommended-blogs/use-latest-post-date', () => ( {
	useLatestPostDate: () => null,
} ) );

const blog = ( feedId: number, name: string ): RecommendedBlog => ( {
	feed_ID: feedId,
	site_ID: 0,
	name,
	site_URL: `https://blog-${ feedId }.example/`,
	feed_URL: `https://blog-${ feedId }.example/feed`,
	icon_URL: `https://blog-${ feedId }.example/icon.png`,
	description: `${ name } writes about things.`,
} );

const mockGroups: RecommendedBlogGroup[] = [
	{ key: 'food', title: 'Food', blogs: [ blog( 1, 'Pasta Daily' ), blog( 2, 'Bread Notes' ) ] },
];

jest.mock( 'calypso/reader/onboarding-rsm/recommended-blogs/groups', () => ( {
	getRecommendedBlogGroups: () => mockGroups,
} ) );

const getPill = ( name: string ) =>
	screen.getByRole( 'button', { name: new RegExp( `^${ name }` ) } );

const getCachedSubscriptions = ( queryClient: QueryClient ) =>
	queryClient
		.getQueryData< SiteSubscriptionsInfiniteData >( getSiteSubscriptionsQueryKey() )
		?.pages.flatMap( ( page ) => page.subscriptions ) ?? [];

afterEach( () => nock.cleanAll() );

describe( 'RecommendedBlogsStep batch follow', () => {
	it( 'keeps a successful follow when an earlier follow in the batch fails later', async () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		queryClient.setQueryData< SiteSubscriptionsInfiniteData >( getSiteSubscriptionsQueryKey(), {
			pageParams: [ 1 ],
			pages: [ { subscriptions: [], totalCount: 0, page: 1, number: 200 } ],
		} );
		const failure = nock( API )
			.post(
				'/rest/v1.1/read/following/mine/new',
				( body ) => body.url === 'https://blog-1.example/feed'
			)
			.delay( 50 )
			.reply( 500, { error: 'follow_failed' } );
		const success = nock( API )
			.post(
				'/rest/v1.1/read/following/mine/new',
				( body ) => body.url === 'https://blog-2.example/feed'
			)
			.reply( 200, {
				subscribed: true,
				subscription: {
					ID: '22',
					URL: 'https://blog-2.example/',
					feed_URL: 'https://blog-2.example/feed',
					blog_ID: '0',
					feed_ID: '2',
				},
			} );
		const onFinish = jest.fn();
		const user = userEvent.setup();
		renderWithProvider(
			<RecommendedBlogsStep onFinish={ onFinish } promptVerification={ false } />,
			{
				queryClient,
			}
		);

		await user.click( getPill( 'Pasta Daily' ) );
		await user.click( getPill( 'Bread Notes' ) );
		await user.click( screen.getByRole( 'button', { name: 'Subscribe to 2 blogs and continue' } ) );

		await waitFor( () =>
			expect(
				screen.getByText( 'We couldn’t subscribe you to 1 blog. Try again, or skip for now.', {
					ignore: '.a11y-speak-region, script, style',
				} )
			).toBeVisible()
		);
		expect( failure.isDone() ).toBe( true );
		expect( success.isDone() ).toBe( true );
		expect( onFinish ).not.toHaveBeenCalled();
		expect( getCachedSubscriptions( queryClient ) ).toEqual( [
			expect.objectContaining( { feed_ID: 2, is_following: true } ),
		] );
		expect( getPill( 'Bread Notes' ) ).toHaveTextContent( 'Already subscribed' );
		expect( getPill( 'Pasta Daily' ) ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( screen.getByText( '1 blog selected' ) ).toBeVisible();
	} );
} );
