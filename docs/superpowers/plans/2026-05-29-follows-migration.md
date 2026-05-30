# Follows Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the full follows layer used by the WordPress.com Reader from Redux/data-layer to React Query, preserve current behavior, and remove `state.reader.follows`.

**Architecture:** `@automattic/api-core` owns `/read/following/mine` endpoint details and response adapters. `@automattic/api-queries` owns query keys, infinite query options, mutation factories, and pure cache patch helpers. `client/reader/data/follows` owns Calypso-specific hooks, full pagination sync, reactive selector hooks, notices, tracking-adjacent side effects, and cache coordination with sites, streams, and the subscription manager.

**Tech Stack:** TypeScript, React, React Query, Calypso Redux during transition, Jest, nock, `@automattic/api-core`, `@automattic/api-queries`.

---

## Scope

Migrate and remove all legacy follows responsibilities:

- `/read/following/mine` paginated sync, including the current `MAX_ITEMS = 2000` cap.
- `/read/following/mine/new` and `/read/following/mine/delete`.
- Post email, comment email, delivery frequency, and post notification delivery methods.
- All follows selectors: all follows, count, follow by feed/blog, alias feed URL, organization grouping, recent sidebar sorting, and is-following.
- Follow-sensitive cache coordination: Reader site query, following stream query, subscription manager query, and onboarding recommendation de-duping.
- Existing notices and recommended-site success side effects.
- Legacy files: `client/state/reader/follows/**`, `client/components/data/sync-reader-follows`, `client/state/selectors/should-sync-reader-follows.js`, and `/read/following/mine*` data-layer handlers.

Out of scope:

- UI redesign.
- Endpoint behavior changes.
- Replacing `@automattic/data-stores` subscription manager internals. This plan only invalidates its existing query key prefixes.

## Design Corrections From Plan Review

- Reactive selector hooks must subscribe to React Query data. They must derive from `useFollows()` or `useInfiniteQuery(..., { select })`, never from `queryClient.getQueryData()` alone.
- `useFollows()` must fetch all pages. It should call `fetchNextPage()` while `hasNextPage && !isFetchingNextPage`.
- Delivery endpoints must keep legacy API routing: post/comment email endpoints use REST `1.2`; notification endpoints use `apiNamespace: 'wpcom/v2'`.
- Alias behavior must be preserved when a requested URL differs from the returned feed URL.
- The consumer list must include every current import of `calypso/state/reader/follows`, including sidebars, onboarding recommendation hooks, stream analytics, subscription manager stale handling, and organization feed info.
- Class components that need hooks must be converted to function components or receive hook-derived props from a function wrapper.
- No new or renamed file basename, hook, component, helper, mutation, or type introduced by this migration may include `reader` or `Reader`. Existing legacy paths and identifiers that already include `reader` are referenced only so the migration can update, delete, or replace them.

## File Structure

New files:

- `packages/api-core/src/read-follows/types.ts`: raw and normalized follows types plus mutation param/response types.
- `packages/api-core/src/read-follows/adapters.ts`: local URL normalization, follow adapter, response adapter, sort helper.
- `packages/api-core/src/read-follows/fetchers.ts`: `/read/following/mine` page fetcher.
- `packages/api-core/src/read-follows/mutators.ts`: follow, unfollow, and delivery-method mutators with legacy API versions.
- `packages/api-core/src/read-follows/index.ts`: barrel export.
- `packages/api-queries/src/read-follows.ts`: query options, query keys, pure selectors, cache patch helpers, and mutation factories.
- `packages/api-queries/src/__tests__/read-follows.test.tsx`: query, adapter, alias, pagination, and mutation cache tests.
- `client/reader/data/follows/cache.ts`: Calypso cache coordination helpers.
- `client/reader/data/follows/use-follows.ts`: full-sync query hook.
- `client/reader/data/follows/use-follow-selectors.ts`: reactive selector hooks.
- `client/reader/data/follows/use-follow-mutations.ts`: Calypso mutation wrappers with notices and cache coordination.
- `client/reader/data/follows/index.ts`: barrel export.
- `client/reader/data/follows/test/use-follows.test.tsx`: reactive hook tests.
- `client/reader/data/follows/test/use-follow-mutations.test.tsx`: mutation wrapper tests.

Modified files:

- `packages/api-core/src/index.ts`
- `packages/api-queries/src/index.ts`
- All production and test files currently importing `calypso/state/reader/follows`.
- `client/state/reader/action-types.ts`
- `client/state/reader/reducer.ts`
- `client/reader/AGENTS.md`

Deleted files at the end:

- `client/state/reader/follows/**`
- `client/components/data/sync-reader-follows/index.js`
- `client/state/selectors/should-sync-reader-follows.js`
- `client/state/selectors/test/should-sync-reader-follows.js`
- `client/state/selectors/test/get-reader-follows.js`
- `client/state/selectors/test/is-following.js`
- `client/state/selectors/test/get-reader-aliased-follow-feed-url.js`
- `client/state/data-layer/wpcom/read/following/mine/**`
- Delivery-method data-layer folders once no action types remain.

---

## Task 1: Add API-Core Read Follows Resource

**Files:**
- Create: `packages/api-core/src/read-follows/types.ts`
- Create: `packages/api-core/src/read-follows/adapters.ts`
- Create: `packages/api-core/src/read-follows/fetchers.ts`
- Create: `packages/api-core/src/read-follows/mutators.ts`
- Create: `packages/api-core/src/read-follows/index.ts`
- Modify: `packages/api-core/src/index.ts`

- [ ] **Step 1: Create `types.ts`**

Use this complete shape. Keep optional fields optional because `/read/following/mine/new` responses can be thinner than list responses.

```ts
export interface FollowDeliveryMethods {
	email?: {
		date_subscribed?: string;
		post_delivery_frequency?: string;
		send_comments?: boolean;
		send_posts?: boolean;
	};
	notification?: {
		send_posts?: boolean;
	};
}

export interface FollowApiSubscription {
	ID?: string | number;
	URL: string;
	blog_ID?: string | number | null;
	feed_ID?: string | number | null;
	date_subscribed?: string;
	last_updated?: string;
	delivery_methods?: FollowDeliveryMethods;
	is_owner?: boolean;
	organization_id?: number | null;
	name?: string;
	unseen_count?: number;
	site_icon?: string | null;
	is_paid_subscription?: boolean;
	is_wpforteams_site?: boolean;
	is_rss?: boolean;
}

export interface FollowItem {
	ID?: number;
	URL: string;
	feed_URL: string;
	blog_ID?: number | null;
	feed_ID?: number | null;
	date_subscribed?: number;
	last_updated?: number;
	delivery_methods?: FollowDeliveryMethods;
	is_owner?: boolean;
	organization_id?: number | null;
	name?: string;
	unseen_count?: number;
	site_icon?: string | null;
	is_following: boolean;
	alias_feed_URLs?: string[];
	error?: unknown;
}

export interface FollowsApiResponse {
	subscriptions: FollowApiSubscription[];
	total_subscriptions: number;
	page: number;
	number: number;
}

export interface FollowsPage {
	follows: FollowItem[];
	totalCount: number | null;
	page: number;
	number: number;
}

export interface FollowSiteParams {
	feedUrl: string;
	source?: string;
}

export interface FollowSiteResponse {
	subscribed?: boolean;
	subscription?: FollowApiSubscription;
	info?: unknown;
}

export interface UnfollowSiteParams {
	feedUrl: string;
	source?: string;
}

export interface UnfollowSiteResponse {
	subscribed?: boolean;
}

export interface FollowDeliveryParams {
	blogId: number;
	sendPosts?: boolean;
	sendComments?: boolean;
	deliveryFrequency?: string;
}
```

- [ ] **Step 2: Create `adapters.ts`**

Do not import `calypso/lib/route` from `api-core`. Implement URL normalization locally.

```ts
import type {
	FollowApiSubscription,
	FollowItem,
	FollowsApiResponse,
	FollowsPage,
} from './types';

export const commonFeedExtensions = [
	'rss',
	'rss.xml',
	'feed',
	'feed/atom',
	'atom.xml',
	'atom',
];

const untrailingslashit = ( url: string ): string => url.replace( /\/$/, '' );

const toValidId = ( id: string | number | null | undefined ): number | null | undefined => {
	if ( id === null || typeof id === 'undefined' ) {
		return id;
	}
	const numeric = Number( id );
	return Number.isFinite( numeric ) && numeric > 0 ? numeric : null;
};

export const prepareComparableUrl = ( url?: string | null ): string | undefined => {
	const preparedUrl = url ? untrailingslashit( url ) : url;
	return preparedUrl?.replace( /^https?:\/\//, '' ).toLowerCase();
};

export const adaptFollow = (
	subscription: FollowApiSubscription
): FollowItem => ( {
	ID: typeof subscription.ID === 'undefined' ? undefined : Number( subscription.ID ),
	URL: subscription.URL,
	feed_URL: subscription.URL,
	blog_ID: toValidId( subscription.blog_ID ),
	feed_ID: toValidId( subscription.feed_ID ),
	date_subscribed: subscription.date_subscribed
		? Date.parse( subscription.date_subscribed )
		: undefined,
	last_updated: subscription.last_updated ? Date.parse( subscription.last_updated ) : undefined,
	delivery_methods: subscription.delivery_methods,
	is_owner: subscription.is_owner,
	organization_id: subscription.organization_id,
	name: subscription.name,
	unseen_count: subscription.unseen_count,
	site_icon: subscription.site_icon,
	is_following: true,
} );

export const adaptFollowsResponse = (
	response: FollowsApiResponse
): FollowsPage => ( {
	follows: Array.isArray( response.subscriptions )
		? response.subscriptions.map( adaptFollow )
		: [],
	totalCount:
		response.page === 1 || response.number > 0 ? response.total_subscriptions ?? null : null,
	page: response.page,
	number: response.number,
} );

export const sortFollowsByLastUpdated = (
	a: Pick< FollowItem, 'last_updated' | 'name' >,
	b: Pick< FollowItem, 'last_updated' | 'name' >
): number => {
	const updatedA = typeof a.last_updated === 'number' && ! isNaN( a.last_updated ) ? a.last_updated : 0;
	const updatedB = typeof b.last_updated === 'number' && ! isNaN( b.last_updated ) ? b.last_updated : 0;
	if ( updatedA < updatedB ) {
		return 1;
	}
	if ( updatedA > updatedB ) {
		return -1;
	}
	return ( a.name ?? '' ).toLowerCase().localeCompare( ( b.name ?? '' ).toLowerCase() );
};
```

- [ ] **Step 3: Create `fetchers.ts`**

```ts
import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import { adaptFollowsResponse } from './adapters';
import type { FollowsApiResponse, FollowsPage } from './types';

export const fetchFollowsPage = ( {
	page = 1,
	number = 200,
	meta = '',
}: {
	page?: number;
	number?: number;
	meta?: string;
} = {} ): Promise< FollowsPage > =>
	wpcom.req
		.get( {
			path: addQueryArgs( '/read/following/mine', { page, number, meta } ),
			apiVersion: '1.2',
			method: 'GET',
		} )
		.then( ( response: FollowsApiResponse ) => adaptFollowsResponse( response ) );
```

- [ ] **Step 4: Create `mutators.ts` with legacy endpoint versions**

```ts
import { wpcom } from '../wpcom-fetcher';
import { adaptFollow } from './adapters';
import type {
	FollowSiteParams,
	FollowSiteResponse,
	FollowDeliveryParams,
	FollowItem,
	UnfollowSiteParams,
	UnfollowSiteResponse,
} from './types';

const buildDeliveryFrequencyBody = ( frequency?: string ) =>
	[ 'instantly', 'daily', 'weekly' ].includes( frequency ?? '' )
		? { delivery_frequency: frequency }
		: {};

export const followSite = async ( {
	feedUrl,
	source,
}: FollowSiteParams ): Promise< FollowItem > => {
	const response: FollowSiteResponse = await wpcom.req.post( {
		path: '/read/following/mine/new',
		apiVersion: '1.1',
		body: { url: feedUrl, source },
	} );

	if ( ! response?.subscribed || ! response.subscription ) {
		const error = new Error( 'Follow request failed' ) as Error & {
			info?: unknown;
			response?: FollowSiteResponse;
		};
		error.info = response?.info;
		error.response = response;
		throw error;
	}

	return adaptFollow( response.subscription );
};

export const unfollowSite = async ( {
	feedUrl,
	source,
}: UnfollowSiteParams ): Promise< UnfollowSiteResponse > => {
	const response: UnfollowSiteResponse = await wpcom.req.post( {
		path: '/read/following/mine/delete',
		apiVersion: '1.1',
		body: { url: feedUrl, source },
	} );
	if ( response?.subscribed ) {
		throw new Error( 'Unfollow request did not unsubscribe' );
	}
	return response;
};

export const updateSitePostEmailSubscription = ( {
	blogId,
	sendPosts,
	deliveryFrequency,
}: FollowDeliveryParams ) =>
	wpcom.req.post( {
		path: `/read/site/${ blogId }/post_email_subscriptions/${ sendPosts ? 'new' : 'delete' }`,
		apiVersion: '1.2',
		body: sendPosts ? buildDeliveryFrequencyBody( deliveryFrequency ) : {},
	} );

export const updateSiteCommentEmailSubscription = ( {
	blogId,
	sendComments,
}: FollowDeliveryParams ) =>
	wpcom.req.post( {
		path: `/read/site/${ blogId }/comment_email_subscriptions/${ sendComments ? 'new' : 'delete' }`,
		apiVersion: '1.2',
		body: {},
	} );

export const updateSitePostEmailDeliveryFrequency = ( {
	blogId,
	deliveryFrequency,
}: FollowDeliveryParams ) =>
	wpcom.req.post( {
		path: `/read/site/${ blogId }/post_email_subscriptions/update`,
		apiVersion: '1.2',
		body: buildDeliveryFrequencyBody( deliveryFrequency ),
	} );

export const updateSitePostNotificationSubscription = ( {
	blogId,
	sendPosts,
}: FollowDeliveryParams ) =>
	wpcom.req.post( {
		path: `/read/sites/${ blogId }/notification-subscriptions/${ sendPosts ? 'new' : 'delete' }`,
		apiNamespace: 'wpcom/v2',
		body: {},
	} );
```

- [ ] **Step 5: Export the resource**

`packages/api-core/src/read-follows/index.ts`:

```ts
export * from './adapters';
export * from './fetchers';
export * from './mutators';
export * from './types';
```

Add to `packages/api-core/src/index.ts` near related read exports:

```ts
export * from './read-follows';
```

- [ ] **Step 6: Verify and commit**

Run:

```bash
yarn typecheck-packages
```

Expected: no type errors in `packages/api-core/src/read-follows/**`.

Commit:

```bash
git add packages/api-core/src/read-follows packages/api-core/src/index.ts
git commit -m "Follows: add read follows api-core resource"
```

---

## Task 2: Add API-Queries Read Follows Query, Selectors, and Mutations

**Files:**
- Create: `packages/api-queries/src/read-follows.ts`
- Create: `packages/api-queries/src/__tests__/read-follows.test.tsx`
- Modify: `packages/api-queries/src/index.ts`

- [ ] **Step 1: Write failing tests**

Create `packages/api-queries/src/__tests__/read-follows.test.tsx`:

```tsx
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import {
	getAliasedFollowFeedUrl,
	getFollowByBlogIdFromData,
	getFollowByFeedIdFromData,
	getFollowsCountFromData,
	getFollowsQueryKey,
	getIsFollowingFromData,
	patchFollow,
	followsQuery,
	type FollowsInfiniteData,
} from '../read-follows';

const BASE = 'https://public-api.wordpress.com';

const newClient = () =>
	new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );

const emptyData = (): FollowsInfiniteData => ( {
	pages: [ { follows: [], page: 1, number: 0, totalCount: 0 } ],
	pageParams: [ 1 ],
} );

describe( 'followsQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches /read/following/mine with the canonical cache key', async () => {
		nock( BASE )
			.get( '/rest/v1.2/read/following/mine' )
			.query( { page: 1, number: 200, meta: '' } )
			.reply( 200, {
				page: 1,
				number: 1,
				total_subscriptions: 1,
				subscriptions: [
					{
						ID: '10',
						URL: 'https://example.com/feed',
						blog_ID: '20',
						feed_ID: '30',
						date_subscribed: '2026-05-01T00:00:00+00:00',
						last_updated: '2026-05-02T00:00:00+00:00',
						name: 'Example',
					},
				],
			} );

		const client = newClient();
		const data = await client.fetchInfiniteQuery( followsQuery() );

		expect( getFollowsQueryKey() ).toEqual( [ 'read', 'follows' ] );
		expect( data.pages[ 0 ].follows[ 0 ] ).toMatchObject( {
			ID: 10,
			feed_URL: 'https://example.com/feed',
			blog_ID: 20,
			feed_ID: 30,
			name: 'Example',
			is_following: true,
		} );
	} );

	it( 'preserves aliases when the requested URL resolves to a different feed URL', () => {
		const client = newClient();
		patchFollow( client, {
			requestedFeedUrl: 'https://example.com',
			follow: {
				URL: 'https://example.com/feed',
				feed_URL: 'https://example.com/feed',
				blog_ID: 20,
				feed_ID: 30,
				name: 'Example',
				is_following: true,
			},
		} );

		const data = client.getQueryData< FollowsInfiniteData >( getFollowsQueryKey() );
		expect( getAliasedFollowFeedUrl( data, 'https://example.com' ) ).toBe(
			'https://example.com/feed'
		);
		expect( getIsFollowingFromData( data, { feedUrl: 'https://example.com' } ) ).toBe(
			true
		);
	} );

	it( 'derives count, blog, and feed selectors from data', () => {
		const data = emptyData();
		data.pages[ 0 ].follows.push( {
			URL: 'https://example.com/feed',
			feed_URL: 'https://example.com/feed',
			blog_ID: 20,
			feed_ID: 30,
			name: 'Example',
			is_following: true,
		} );

		expect( getFollowsCountFromData( data ) ).toBe( 1 );
		expect( getFollowByBlogIdFromData( data, 20 )?.name ).toBe( 'Example' );
		expect( getFollowByFeedIdFromData( data, 30 )?.name ).toBe( 'Example' );
	} );
} );
```

- [ ] **Step 2: Run failing test**

```bash
yarn test-packages packages/api-queries/src/__tests__/read-follows.test.tsx
```

Expected: FAIL because `packages/api-queries/src/read-follows.ts` does not exist.

- [ ] **Step 3: Implement `read-follows.ts`**

Create `packages/api-queries/src/read-follows.ts`:

```ts
import {
	commonFeedExtensions,
	fetchFollowsPage,
	followSite,
	prepareComparableUrl,
	sortFollowsByLastUpdated,
	unfollowSite,
	updateSiteCommentEmailSubscription,
	updateSitePostEmailDeliveryFrequency,
	updateSitePostEmailSubscription,
	updateSitePostNotificationSubscription,
	type FollowSiteParams,
	type FollowDeliveryParams,
	type FollowItem,
	type FollowsPage,
	type UnfollowSiteParams,
} from '@automattic/api-core';
import {
	infiniteQueryOptions,
	mutationOptions,
	type InfiniteData,
	type QueryClient,
} from '@tanstack/react-query';

const ITEMS_PER_PAGE = 200;
const MAX_ITEMS = 2000;
const STALE_TIME = 60 * 60 * 1000;
const MAX_PAGES_TO_FETCH = MAX_ITEMS / ITEMS_PER_PAGE;

export type FollowsInfiniteData = InfiniteData< FollowsPage, number >;

export const getFollowsQueryKey = () => [ 'read', 'follows' ] as const;

export const followsQuery = () =>
	infiniteQueryOptions<
		FollowsPage,
		Error,
		FollowsInfiniteData,
		ReturnType< typeof getFollowsQueryKey >,
		number
	>( {
		queryKey: getFollowsQueryKey(),
		queryFn: ( { pageParam = 1 } ) =>
			fetchFollowsPage( { page: pageParam, number: ITEMS_PER_PAGE, meta: '' } ),
		initialPageParam: 1,
		getNextPageParam: ( lastPage ) =>
			lastPage.number > 0 && lastPage.page < MAX_PAGES_TO_FETCH
				? lastPage.page + 1
				: undefined,
		staleTime: STALE_TIME,
		meta: { persist: true },
	} );

const emptyData = (): FollowsInfiniteData => ( {
	pages: [ { follows: [], page: 1, number: 0, totalCount: 0 } ],
	pageParams: [ 1 ],
} );

export const getFollowsFromData = (
	data: FollowsInfiniteData | undefined
): FollowItem[] => data?.pages.flatMap( ( page ) => page.follows ).filter( ( item ) => ! item.error ) ?? [];

export const getFollowsCountFromData = (
	data: FollowsInfiniteData | undefined
): number => {
	const itemCount = getFollowsFromData( data ).filter( ( follow ) => follow.is_following ).length;
	const totalCount = data?.pages.find( ( page ) => typeof page.totalCount === 'number' )?.totalCount ?? 0;
	return Math.max( totalCount, itemCount );
};

export const getFollowByBlogIdFromData = (
	data: FollowsInfiniteData | undefined,
	blogId: number
): FollowItem | undefined =>
	getFollowsFromData( data ).find( ( follow ) => follow.blog_ID === Number( blogId ) );

export const getFollowByFeedIdFromData = (
	data: FollowsInfiniteData | undefined,
	feedId: number
): FollowItem | undefined =>
	getFollowsFromData( data ).find( ( follow ) => follow.feed_ID === Number( feedId ) );

export const getAliasedFollowFeedUrl = (
	data: FollowsInfiniteData | undefined,
	feedUrl: string
): string => {
	const urlKey = prepareComparableUrl( feedUrl );
	const follows = getFollowsFromData( data );
	const exact = follows.find( ( follow ) => prepareComparableUrl( follow.feed_URL ) === urlKey );
	if ( exact ) {
		return exact.feed_URL;
	}
	const alias = follows.find( ( follow ) => {
		const comparableFeedUrl = prepareComparableUrl( follow.feed_URL );
		return (
			follow.alias_feed_URLs?.includes( urlKey ?? '' ) ||
			commonFeedExtensions.some( ( extension ) => `${ urlKey }/${ extension }` === comparableFeedUrl )
		);
	} );
	return alias?.feed_URL ?? feedUrl;
};

export const getIsFollowingFromData = (
	data: FollowsInfiniteData | undefined,
	{ feedUrl, feedId, blogId }: { feedUrl?: string; feedId?: number; blogId?: number }
): boolean => {
	const follows = getFollowsFromData( data );
	let follow: FollowItem | undefined;
	if ( feedUrl ) {
		const comparableUrl = prepareComparableUrl( getAliasedFollowFeedUrl( data, feedUrl ) );
		follow = follows.find( ( item ) => prepareComparableUrl( item.feed_URL ) === comparableUrl );
	}
	if ( ! follow && feedId ) {
		follow = follows.find( ( item ) => item.feed_ID === feedId );
	}
	if ( ! follow && blogId ) {
		follow = follows.find( ( item ) => item.blog_ID === blogId );
	}
	return !! follow?.is_following;
};

export const getFollowedSitesFromData = (
	data: FollowsInfiniteData | undefined,
	noOrganizationId: number
): FollowItem[] =>
	getFollowsFromData( data )
		.filter( ( follow ) => follow.organization_id === noOrganizationId )
		.sort( sortFollowsByLastUpdated );

export const getOrganizationFollowsFromData = (
	data: FollowsInfiniteData | undefined,
	organizationId: number
): FollowItem[] =>
	getFollowsFromData( data )
		.filter( ( follow ) => follow.organization_id === organizationId )
		.sort( sortFollowsByLastUpdated );

export const patchFollow = (
	queryClient: QueryClient,
	{ requestedFeedUrl, follow }: { requestedFeedUrl?: string; follow: FollowItem }
) => {
	queryClient.setQueryData< FollowsInfiniteData >( getFollowsQueryKey(), ( previous ) => {
		const data = previous ?? emptyData();
		const comparableReturnedUrl = prepareComparableUrl( follow.feed_URL );
		const comparableRequestedUrl = prepareComparableUrl( requestedFeedUrl );
		const followWithAlias =
			comparableRequestedUrl && comparableRequestedUrl !== comparableReturnedUrl
				? {
						...follow,
						alias_feed_URLs: Array.from(
							new Set( [ ...( follow.alias_feed_URLs ?? [] ), comparableRequestedUrl ] )
						),
				  }
				: follow;
		let replaced = false;
		const pages = data.pages.map( ( page ) => ( {
			...page,
			follows: page.follows.map( ( item ) => {
				const itemUrl = prepareComparableUrl( item.feed_URL );
				const itemAliases = item.alias_feed_URLs ?? [];
				const matches =
					itemUrl === comparableReturnedUrl ||
					( comparableRequestedUrl ? itemAliases.includes( comparableRequestedUrl ) : false );
				if ( ! matches ) {
					return item;
				}
				replaced = true;
				return { ...item, ...followWithAlias, is_following: true };
			} ),
		} ) );
		if ( ! replaced ) {
			pages[ 0 ] = {
				...pages[ 0 ],
				follows: [ followWithAlias, ...pages[ 0 ].follows ],
				totalCount:
					typeof pages[ 0 ].totalCount === 'number' ? pages[ 0 ].totalCount + 1 : pages[ 0 ].totalCount,
			};
		}
		return { ...data, pages };
	} );
};

export const markFollowUnfollowed = ( queryClient: QueryClient, feedUrl: string ) => {
	const comparableUrl = prepareComparableUrl( feedUrl );
	queryClient.setQueryData< FollowsInfiniteData >( getFollowsQueryKey(), ( previous ) => {
		if ( ! previous ) {
			return previous;
		}
		return {
			...previous,
			pages: previous.pages.map( ( page ) => ( {
				...page,
				follows: page.follows.map( ( follow ) =>
					prepareComparableUrl( follow.feed_URL ) === comparableUrl ||
					follow.alias_feed_URLs?.includes( comparableUrl ?? '' )
						? {
								...follow,
								is_following: false,
								delivery_methods: {
									...follow.delivery_methods,
									notification: { send_posts: false },
								},
						  }
						: follow
				),
			} ) ),
		};
	} );
};

export const followSiteMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: ( params: FollowSiteParams ) => followSite( params ),
		onSuccess: ( follow, params ) => {
			patchFollow( queryClient, { requestedFeedUrl: params.feedUrl, follow } );
			queryClient.invalidateQueries( { queryKey: [ 'read', 'site-subscriptions' ] } );
		},
	} );

export const unfollowSiteMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: ( params: UnfollowSiteParams ) => unfollowSite( params ),
		onSuccess: ( _data, params ) => {
			markFollowUnfollowed( queryClient, params.feedUrl );
			queryClient.invalidateQueries( { queryKey: [ 'read', 'site-subscriptions' ] } );
		},
	} );

export const updateSitePostEmailSubscriptionMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: ( params: FollowDeliveryParams ) =>
			updateSitePostEmailSubscription( params ),
		onSettled: () => queryClient.invalidateQueries( { queryKey: getFollowsQueryKey() } ),
	} );

export const updateSiteCommentEmailSubscriptionMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: ( params: FollowDeliveryParams ) =>
			updateSiteCommentEmailSubscription( params ),
		onSettled: () => queryClient.invalidateQueries( { queryKey: getFollowsQueryKey() } ),
	} );

export const updateSitePostEmailDeliveryFrequencyMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: ( params: FollowDeliveryParams ) =>
			updateSitePostEmailDeliveryFrequency( params ),
		onSettled: () => queryClient.invalidateQueries( { queryKey: getFollowsQueryKey() } ),
	} );

export const updateSitePostNotificationSubscriptionMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: ( params: FollowDeliveryParams ) =>
			updateSitePostNotificationSubscription( params ),
		onSettled: () => queryClient.invalidateQueries( { queryKey: getFollowsQueryKey() } ),
	} );
```

- [ ] **Step 4: Export from `packages/api-queries/src/index.ts`**

```ts
export * from './read-follows';
```

- [ ] **Step 5: Verify and commit**

Run:

```bash
yarn test-packages packages/api-queries/src/__tests__/read-follows.test.tsx
```

Expected: PASS.

Commit:

```bash
git add packages/api-queries/src/read-follows.ts packages/api-queries/src/__tests__/read-follows.test.tsx packages/api-queries/src/index.ts
git commit -m "Follows: add follows React Query resource"
```

---

## Task 3: Add Reactive Follows Hooks

**Files:**
- Create: `client/reader/data/follows/cache.ts`
- Create: `client/reader/data/follows/use-follows.ts`
- Create: `client/reader/data/follows/use-follow-selectors.ts`
- Create: `client/reader/data/follows/use-follow-mutations.ts`
- Create: `client/reader/data/follows/index.ts`
- Create: `client/reader/data/follows/test/use-follows.test.tsx`
- Create: `client/reader/data/follows/test/use-follow-mutations.test.tsx`

- [ ] **Step 1: Write failing reactive hook tests**

Create `client/reader/data/follows/test/use-follows.test.tsx`:

```tsx
import {
	QueryClient,
	QueryClientProvider,
	type InfiniteData,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import {
	getFollowsQueryKey,
	patchFollow,
	type FollowsInfiniteData,
} from '@automattic/api-queries';
import { useIsFollowing, useFollowForBlog, useFollowForFeed } from '../use-follow-selectors';
import { useFollows } from '../use-follows';

const createClient = () =>
	new QueryClient( {
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	} );

const seedData = (): FollowsInfiniteData => ( {
	pages: [ { follows: [], page: 1, number: 0, totalCount: 0 } ],
	pageParams: [ 1 ],
} );

describe( 'follows hooks', () => {
	it( 'reacts when follows cache changes', async () => {
		const queryClient = createClient();
		queryClient.setQueryData< InfiniteData< unknown, number > >(
			getFollowsQueryKey(),
			seedData()
		);

		const wrapper = ( { children }: PropsWithChildren ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		const follows = renderHook( () => useFollows(), { wrapper } );
		const isFollowing = renderHook( () => useIsFollowing( { feedUrl: 'https://example.com' } ), {
			wrapper,
		} );

		expect( follows.result.current.follows ).toHaveLength( 0 );
		expect( isFollowing.result.current ).toBe( false );

		act( () => {
			patchFollow( queryClient, {
				requestedFeedUrl: 'https://example.com',
				follow: {
					URL: 'https://example.com/feed',
					feed_URL: 'https://example.com/feed',
					blog_ID: 123,
					feed_ID: 456,
					name: 'Example',
					organization_id: 0,
					is_following: true,
				},
			} );
		} );

		await waitFor( () => expect( follows.result.current.follows ).toHaveLength( 1 ) );
		expect( renderHook( () => useFollowForBlog( 123 ), { wrapper } ).result.current?.name ).toBe( 'Example' );
		expect( renderHook( () => useFollowForFeed( 456 ), { wrapper } ).result.current?.name ).toBe( 'Example' );
		expect( isFollowing.result.current ).toBe( true );
	} );
} );
```

- [ ] **Step 2: Run failing tests**

```bash
yarn test-client client/reader/data/follows/test/use-follows.test.tsx
```

Expected: FAIL because `client/reader/data/follows` does not exist.

- [ ] **Step 3: Implement `use-follows.ts` with full pagination sync**

```ts
import {
	getFollowsCountFromData,
	getFollowsFromData,
	followsQuery,
} from '@automattic/api-queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useFollows = () => {
	const query = useInfiniteQuery( followsQuery() );

	useEffect( () => {
		if ( query.hasNextPage && ! query.isFetchingNextPage ) {
			query.fetchNextPage();
		}
	}, [ query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage ] );

	return {
		...query,
		follows: getFollowsFromData( query.data ),
		count: getFollowsCountFromData( query.data ),
	};
};
```

- [ ] **Step 4: Implement `use-follow-selectors.ts` using reactive query data**

```ts
import {
	getAliasedFollowFeedUrl,
	getFollowByBlogIdFromData,
	getFollowByFeedIdFromData,
	getFollowedSitesFromData,
	getIsFollowingFromData,
	getOrganizationFollowsFromData,
} from '@automattic/api-queries';
import { NO_ORG_ID } from 'calypso/state/reader/organizations/constants';
import { useFollows } from './use-follows';

export const useFollowForBlog = ( blogId?: number ) => {
	const { data } = useFollows();
	return typeof blogId === 'number' ? getFollowByBlogIdFromData( data, blogId ) : undefined;
};

export const useFollowForFeed = ( feedId?: number ) => {
	const { data } = useFollows();
	return typeof feedId === 'number' ? getFollowByFeedIdFromData( data, feedId ) : undefined;
};

export const useIsFollowing = ( args: { feedUrl?: string; feedId?: number; blogId?: number } ) => {
	const { data } = useFollows();
	return getIsFollowingFromData( data, args );
};

export const useAliasedFollowFeedUrl = ( feedUrl: string ) => {
	const { data } = useFollows();
	return getAliasedFollowFeedUrl( data, feedUrl );
};

export const useFollowedSites = () => {
	const { data } = useFollows();
	return getFollowedSitesFromData( data, NO_ORG_ID );
};

export const useOrganizationFollows = ( organizationId: number ) => {
	const { data } = useFollows();
	return getOrganizationFollowsFromData( data, organizationId );
};

export const useHasFollowOrganization = ( feedId?: number, blogId?: number ) => {
	const byFeed = useFollowForFeed( feedId );
	const byBlog = useFollowForBlog( blogId );
	return !! ( byFeed ?? byBlog )?.organization_id;
};
```

- [ ] **Step 5: Implement Calypso cache helpers**

Create `client/reader/data/follows/cache.ts`:

```ts
import { prepareComparableUrl, type ReadSiteResponse } from '@automattic/api-core';
import {
	getFollowsQueryKey,
	readSiteQuery,
} from '@automattic/api-queries';
import type { QueryClient } from '@tanstack/react-query';

export const patchReadSiteFollowStatus = (
	queryClient: QueryClient,
	feedUrl: string,
	isFollowing: boolean
) => {
	const comparableFeedUrl = prepareComparableUrl( feedUrl );
	for ( const [ queryKey, site ] of queryClient.getQueriesData< ReadSiteResponse >( {
		queryKey: [ 'read', 'sites' ],
	} ) ) {
		if ( prepareComparableUrl( site?.feed_URL ) === comparableFeedUrl ) {
			queryClient.setQueryData( queryKey, { ...site, is_following: isFollowing } );
		}
	}
};

export const patchReadSiteFollowStatusByBlogId = (
	queryClient: QueryClient,
	blogId: number | undefined,
	isFollowing: boolean
) => {
	if ( typeof blogId !== 'number' ) {
		return;
	}
	queryClient.setQueryData< ReadSiteResponse >( readSiteQuery( blogId ).queryKey, ( previous ) =>
		previous ? { ...previous, is_following: isFollowing } : previous
	);
};

export const invalidateFollowSensitiveCaches = ( queryClient: QueryClient ) => {
	queryClient.invalidateQueries( { queryKey: getFollowsQueryKey() } );
	queryClient.invalidateQueries( { queryKey: [ 'read', 'stream', 'following' ] } );
	queryClient.invalidateQueries( { queryKey: [ 'read', 'stream', 'infinite', 'following' ] } );
	queryClient.invalidateQueries( { queryKey: [ 'read', 'site-subscriptions' ] } );
	queryClient.invalidateQueries( { queryKey: [ 'read', 'subscriptions-count' ] } );
};
```

- [ ] **Step 6: Implement mutation wrappers**

Create `client/reader/data/follows/use-follow-mutations.ts`:

```ts
import config from '@automattic/calypso-config';
import {
	followSiteMutation,
	unfollowSiteMutation,
	updateSiteCommentEmailSubscriptionMutation,
	updateSitePostEmailDeliveryFrequencyMutation,
	updateSitePostEmailSubscriptionMutation,
	updateSitePostNotificationSubscriptionMutation,
} from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { followedRecommendedSite } from 'calypso/state/reader/recommended-sites/actions';
import {
	invalidateFollowSensitiveCaches,
	patchReadSiteFollowStatus,
	patchReadSiteFollowStatusByBlogId,
} from './cache';

interface RecommendedSiteInfo {
	seed: number;
	siteId: number;
	siteTitle: string;
}

export const getFollowingSource = () => config( 'readerFollowingSource' );

export const useFollowSite = ( recommendedSiteInfo?: RecommendedSiteInfo ) => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const baseMutation = followSiteMutation( queryClient );

	return useMutation( {
		...baseMutation,
		onMutate: ( params ) => {
			patchReadSiteFollowStatus( queryClient, params.feedUrl, true );
		},
		onSuccess: ( follow, params, context ) => {
			baseMutation.onSuccess?.( follow, params, context );
			patchReadSiteFollowStatus( queryClient, follow.feed_URL, true );
			patchReadSiteFollowStatusByBlogId( queryClient, follow.blog_ID ?? undefined, true );
			invalidateFollowSensitiveCaches( queryClient );
			if ( recommendedSiteInfo ) {
				dispatch( followedRecommendedSite( { siteId: recommendedSiteInfo.siteId, seed: recommendedSiteInfo.seed } ) );
				dispatch(
					successNotice(
						translate( "Success! You're now subscribed to %s.", { args: recommendedSiteInfo.siteTitle } ),
						{ duration: 5000 }
					)
				);
			}
		},
		onError: ( _error, params ) => {
			dispatch(
				errorNotice(
					translate( 'Sorry, there was a problem subscribing %(url)s. Please try again.', {
						args: { url: params.feedUrl },
					} ),
					{ duration: 5000 }
				)
			);
			patchReadSiteFollowStatus( queryClient, params.feedUrl, false );
		},
	} );
};

export const useUnfollowSite = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const baseMutation = unfollowSiteMutation( queryClient );

	return useMutation( {
		...baseMutation,
		onMutate: ( params ) => {
			patchReadSiteFollowStatus( queryClient, params.feedUrl, false );
		},
		onSuccess: ( data, params, context ) => {
			baseMutation.onSuccess?.( data, params, context );
			invalidateFollowSensitiveCaches( queryClient );
		},
		onError: ( _error, params ) => {
			dispatch(
				errorNotice(
					translate( 'Sorry, there was a problem unsubscribing %(siteTitle)s. Please try again.', {
						args: { siteTitle: params.feedUrl },
					} ),
					{ duration: 5000 }
				)
			);
			patchReadSiteFollowStatus( queryClient, params.feedUrl, true );
		},
	} );
};

export const useFollowDeliveryMutations = () => {
	const queryClient = useQueryClient();
	return {
		updatePostEmail: useMutation( updateSitePostEmailSubscriptionMutation( queryClient ) ),
		updateCommentEmail: useMutation( updateSiteCommentEmailSubscriptionMutation( queryClient ) ),
		updateDeliveryFrequency: useMutation(
			updateSitePostEmailDeliveryFrequencyMutation( queryClient )
		),
		updatePostNotifications: useMutation(
			updateSitePostNotificationSubscriptionMutation( queryClient )
		),
	};
};
```

- [ ] **Step 7: Export hooks**

`client/reader/data/follows/index.ts`:

```ts
export * from './cache';
export * from './use-follow-mutations';
export * from './use-follow-selectors';
export * from './use-follows';
```

- [ ] **Step 8: Verify and commit**

Run:

```bash
yarn test-client client/reader/data/follows/test/use-follows.test.tsx
```

Expected: PASS.

Commit:

```bash
git add client/reader/data/follows
git commit -m "Follows: add reactive follows hooks"
```

---

## Task 4: Migrate Follow and Unfollow Writers

**Files:**
- Modify: `client/blocks/follow-button/index.tsx`
- Modify: `client/reader/recommended-sites/recommended-site.tsx`
- Modify: `client/reader/components/reader-main/pending-action-handler.tsx`
- Modify: `client/reader/onboarding-rsm/interests-modal/index.tsx`
- Modify: `client/reader/new-subscription/components/add-subscription-form/index.tsx`
- Modify tests in the same folders that mock `calypso/state/reader/follows/actions`.

- [ ] **Step 1: Update writer tests**

Replace mocks of `calypso/state/reader/follows/actions` with:

```ts
const followMutate = jest.fn();
const unfollowMutate = jest.fn();

jest.mock( 'calypso/reader/data/follows', () => ( {
	getFollowingSource: jest.fn( () => 'test-source' ),
	useFollowSite: jest.fn( () => ( { mutate: followMutate, mutateAsync: followMutate, isPending: false } ) ),
	useUnfollowSite: jest.fn( () => ( { mutate: unfollowMutate, mutateAsync: unfollowMutate, isPending: false } ) ),
	useIsFollowing: jest.fn( () => false ),
	useFollows: jest.fn( () => ( { follows: [], refetch: jest.fn() } ) ),
} ) );
```

Expected assertion for a follow:

```ts
expect( followMutate ).toHaveBeenCalledWith( {
	feedUrl: 'https://example.com/feed',
	source: 'test-source',
} );
```

- [ ] **Step 2: Run failing writer tests**

```bash
yarn test-client client/blocks/follow-button client/reader/new-subscription client/reader/onboarding-rsm
```

Expected: FAIL while Redux follows actions are still imported.

- [ ] **Step 3: Migrate `client/blocks/follow-button/index.tsx`**

Keep login and email verification branches unchanged. Replace `follow`/`unfollow` dispatches with:

```ts
const following = useIsFollowing( {
	feedUrl: props.siteUrl,
	feedId: props.feedId,
	blogId: props.siteId,
} );
const followSite = useFollowSite();
const unfollowSite = useUnfollowSite();

if ( following ) {
	unfollowSite.mutate( { feedUrl: props.siteUrl, source: getFollowingSource() } );
} else {
	followSite.mutate( { feedUrl: props.siteUrl, source: getFollowingSource() } );
}
```

- [ ] **Step 4: Migrate `client/reader/recommended-sites/recommended-site.tsx`**

Remove `isReaderFollowFeedLoading` and `useInvalidateSiteSubscriptionsCache`. Use the mutation's pending state:

```ts
const followSite = useFollowSite( {
	siteId,
	seed: recommendedSitesSeed,
	siteTitle,
} );
const isSubscribeLoading = followSite.isPending;

followSite.mutate( {
	feedUrl: siteUrl,
	source: getFollowingSource(),
} );
```

Keep existing tracks, bumpStats, GA calls, and dismiss behavior.

- [ ] **Step 5: Migrate pending/onboarding writers**

For each remaining `dispatch( follow( feedUrl ... ) )`, create a hook mutation at component scope:

```ts
const followSite = useFollowSite();
```

Then write:

```ts
followSite.mutate( {
	feedUrl,
	source: getFollowingSource(),
} );
```

For `requestFollows()` in `add-subscription-form`, replace the dispatch with query invalidation:

```ts
const queryClient = useQueryClient();
queryClient.invalidateQueries( { queryKey: getFollowsQueryKey() } );
```

- [ ] **Step 6: Verify and commit**

Run:

```bash
yarn test-client client/blocks/follow-button client/reader/new-subscription client/reader/onboarding-rsm
```

Expected: PASS.

Commit:

```bash
git add client/blocks/follow-button client/reader/recommended-sites client/reader/components/reader-main/pending-action-handler.tsx client/reader/onboarding-rsm client/reader/new-subscription
git commit -m "Follows: migrate follows write consumers"
```

---

## Task 5: Migrate Reactive Follow Selector Consumers

**Files:**
- Modify: `client/blocks/reader-feed-header/follow.tsx`
- Modify: `client/blocks/reader-full-post/index.jsx`
- Modify: `client/blocks/reader-post-card/index.jsx`
- Modify: `client/blocks/reader-post-options-menu/reader-post-ellipsis-menu.jsx`
- Modify: `client/blocks/reader-subscription-list-item/index.jsx`
- Modify: `client/blocks/reader-subscription-list-item/connected.jsx`
- Modify: `client/reader/recent/index.tsx`
- Modify: `client/reader/feed-stream/index.jsx`
- Modify: `client/reader/on-this-day/index.tsx`
- Modify: `client/reader/search-stream/index.jsx`
- Modify: `client/reader/stream/post.jsx`
- Modify: `client/reader/stream/x-post.jsx`
- Modify: `client/reader/list-manage/item-adder.jsx`
- Modify: `client/reader/list-manage/subscription-item-adder.jsx`

- [ ] **Step 1: Replace function component selectors**

Use these mappings:

```ts
getReaderFollowForFeed( state, feedId ) -> useFollowForFeed( feedId )
getReaderFollowForBlog( state, blogId ) -> useFollowForBlog( blogId )
isFollowing( state, args ) -> useIsFollowing( args )
hasReaderFollowOrganization( state, feedId, blogId ) -> useHasFollowOrganization( feedId, blogId )
getAliasedFollowFeedUrl( state, feedUrl ) -> useAliasedFollowFeedUrl( feedUrl )
getReaderFollows( state ) -> useFollows().follows
```

- [ ] **Step 2: Convert class components with function wrappers**

For class components that currently receive follows through `connect`, keep the class and add a wrapper:

```tsx
const withFollowProps = ( WrappedComponent ) =>
	function WithFollowProps( props ) {
		const follow = useFollowForFeed( props.feedId );
		const hasOrganization = useHasFollowOrganization( props.feedId, props.blogId );
		return <WrappedComponent { ...props } follow={ follow } hasOrganization={ hasOrganization } />;
	};
```

Export the wrapper, or pass it into the existing `connect` if the component still needs other Redux props.

- [ ] **Step 3: Replace list-manage sync**

In `client/reader/list-manage/item-adder.jsx`, remove `<SyncReaderFollows />` and call:

```ts
useFollows();
```

The call is enough because `useFollows()` fetches all pages.

- [ ] **Step 4: Verify and commit**

Run:

```bash
yarn test-client client/blocks client/reader/recent client/reader/feed-stream client/reader/on-this-day client/reader/search-stream client/reader/stream client/reader/list-manage
```

Expected: PASS.

Commit:

```bash
git add client/blocks client/reader/recent client/reader/feed-stream client/reader/on-this-day client/reader/search-stream client/reader/stream client/reader/list-manage
git commit -m "Follows: migrate follows selector consumers"
```

---

## Task 6: Migrate Sidebar, Stream Count, Organization Info, and Recommendation Dedupe

**Files:**
- Modify: `client/reader/sidebar/reader-sidebar-recent/index.tsx`
- Modify: `client/reader/sidebar/reader-sidebar-organizations/list.jsx`
- Modify: `client/reader/stream/index.jsx`
- Modify: `client/state/reader/analytics/actions.js`
- Modify: `client/state/reader/analytics/useRecordReaderTracksEvent.ts`
- Modify: `client/state/reader/organizations/selectors/get-reader-organizations-feeds-info.js`
- Modify: `client/state/reader/organizations/selectors/index.js`
- Modify: `client/reader/onboarding-rsm/subscribe-modal/use-subscribe-recommendations.ts`

- [ ] **Step 1: Migrate recent sidebar**

Replace:

```ts
const sites = useSelector< AppState, Site[] >( getReaderFollowedSites );
```

with:

```ts
const sites = useFollowedSites();
```

Remove the local `Site` type if it duplicates `FollowItem`; use `FollowItem` from `@automattic/api-core`.

- [ ] **Step 2: Migrate organization sidebar list**

Wrap the class component:

```tsx
function OrganizationsListWithFollows( props ) {
	const sites = useOrganizationFollows( props.organization.id );
	return <ReaderSidebarOrganizationsList { ...props } sites={ sites } />;
}
```

Keep Redux `connect` only for `isOrganizationOpen` and `toggleReaderSidebarOrganization`.

- [ ] **Step 3: Migrate stream follows count**

In `client/reader/stream/index.jsx`, replace `getReaderFollowsCount` mapState usage with a function wrapper or hook:

```ts
const { count: followsCount } = useFollows();
```

Pass `followsCount` to the existing stream component as a prop so class internals do not call hooks.

- [ ] **Step 4: Replace thunk analytics count**

In `client/state/reader/analytics/actions.js`:

```js
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import { getFollowsCountFromData, getFollowsQueryKey } from '@automattic/api-queries';

const queryClient = getCalypsoQueryClient();
const followsCount = queryClient
	? getFollowsCountFromData( queryClient.getQueryData( getFollowsQueryKey() ) )
	: 0;
```

In `useRecordReaderTracksEvent.ts`:

```ts
const { count: followsCount } = useFollows();
```

- [ ] **Step 5: Replace organization feed info selector**

If `getReaderOrganizationFeedsInfo` has no production consumers after sidebar migration, delete `client/state/reader/organizations/selectors/get-reader-organizations-feeds-info.js` and remove its export. If a production consumer remains, replace it with a hook in `client/reader/data/follows/use-follow-selectors.ts`:

```ts
export const useOrganizationFeedsInfo = ( organizationId: number ) => {
	const sites = useOrganizationFollows( organizationId );
	return {
		unseenCount: sites.reduce( ( sum, item ) => sum + ( item.unseen_count ?? 0 ), 0 ),
		feedIds: sites.map( ( item ) => item.feed_ID ).filter( Boolean ),
		feedUrls: sites.map( ( item ) => item.feed_URL ).filter( Boolean ),
	};
};
```

- [ ] **Step 6: Migrate onboarding recommendation de-dupe**

In `client/reader/onboarding-rsm/subscribe-modal/use-subscribe-recommendations.ts`, replace Redux selector `getReaderFollowingItemsRaw` with:

```ts
const { follows } = useFollows();
const rawFollowingItems = follows.filter( ( item ) => item.is_following );
```

Replace imports of `FollowItem` and `prepareComparableUrl` from `calypso/state/reader/follows/**` with:

```ts
import { prepareComparableUrl, type FollowItem } from '@automattic/api-core';
```

- [ ] **Step 7: Verify and commit**

Run:

```bash
yarn test-client client/reader/sidebar client/reader/stream client/reader/onboarding-rsm client/state/reader/analytics client/state/reader/organizations
```

Expected: PASS.

Commit:

```bash
git add client/reader/sidebar client/reader/stream client/reader/onboarding-rsm client/state/reader/analytics client/state/reader/organizations
git commit -m "Follows: migrate follows aggregate consumers"
```

---

## Task 7: Migrate Site Notification Settings and Delivery Mutations

**Files:**
- Modify: `client/blocks/reader-site-notification-settings/index.jsx`
- Modify: `client/blocks/reader-feed-header/follow.tsx`
- Modify: `client/blocks/reader-subscription-list-item/index.jsx`
- Test: `client/blocks/reader-site-notification-settings/test/index.tsx`

- [ ] **Step 1: Convert class component to function component**

Hooks are required, so convert the default export from class to a function component named `SiteNotificationSettings`. Preserve existing DOM, popover behavior, `QueryUserSettings`, tracks events, local refs/state, legacy CSS class names, and the existing import path.

Use this component name:

```tsx
function SiteNotificationSettings( props ) {
	// Existing render body moves here with hook-based state and callbacks.
}

SiteNotificationSettings.displayName = 'SiteNotificationSettings';
```

Use:

```tsx
const { follows } = useFollows();
const follow = follows.find( ( item ) => item.blog_ID === siteId );
const deliveryMethodsEmail = get( follow, [ 'delivery_methods', 'email' ], {} );
const sendNewCommentsByEmail = !! deliveryMethodsEmail.send_comments;
const sendNewPostsByEmail = !! deliveryMethodsEmail.send_posts;
const emailDeliveryFrequency = deliveryMethodsEmail.post_delivery_frequency;
const sendNewPostsByNotification = get(
	follow,
	[ 'delivery_methods', 'notification', 'send_posts' ],
	false
);
const {
	updatePostEmail,
	updateCommentEmail,
	updateDeliveryFrequency,
	updatePostNotifications,
} = useFollowDeliveryMutations();
```

Keep `isEmailBlocked` from Redux:

```ts
const isEmailBlocked = useSelector( ( state ) =>
	getUserSetting( state, 'subscription_delivery_email_blocked' )
);
```

- [ ] **Step 2: Replace delivery handlers**

Use these exact mutation calls:

```ts
updatePostEmail.mutate( {
	blogId: siteId,
	sendPosts: ! sendNewPostsByEmail,
	deliveryFrequency: emailDeliveryFrequency,
} );

updateCommentEmail.mutate( {
	blogId: siteId,
	sendComments: ! sendNewCommentsByEmail,
} );

updateDeliveryFrequency.mutate( {
	blogId: siteId,
	deliveryFrequency,
} );

updatePostNotifications.mutate( {
	blogId: siteId,
	sendPosts: ! sendNewPostsByNotification,
} );
```

Keep existing `recordTracksEvent` calls and event names.

- [ ] **Step 3: Update import identifiers**

In `client/blocks/reader-feed-header/follow.tsx` and `client/blocks/reader-subscription-list-item/index.jsx`, keep the existing import path but use the component identifier without `Reader`:

```tsx
import SiteNotificationSettings from 'calypso/blocks/reader-site-notification-settings';
```

Render it as:

```tsx
<SiteNotificationSettings siteId={ siteId } />
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
yarn test-client client/blocks/reader-site-notification-settings/test/index.tsx
```

Expected: PASS.

Commit:

```bash
git add client/blocks/reader-site-notification-settings client/blocks/reader-feed-header/follow.tsx client/blocks/reader-subscription-list-item/index.jsx
git commit -m "Follows: migrate follow delivery settings"
```

---

## Task 8: Replace Sync/Stale Refreshes

**Files:**
- Modify: `client/reader/components/reader-main/index.jsx`
- Modify: `client/reader/site-subscriptions-manager/subscriptions-manager-wrapper.tsx`
- Modify: `client/reader/onboarding-rsm/use-refresh-following-streams.ts`
- Modify: `client/reader/onboarding-rsm/test/use-refresh-following-streams.test.ts`
- Delete later: `client/components/data/sync-reader-follows/index.js`
- Delete later: `client/state/selectors/should-sync-reader-follows.js`

- [ ] **Step 1: Replace main shell sync component**

In `client/reader/components/reader-main/index.jsx`, replace `<SyncReaderFollows />` with:

```tsx
function SyncFollowsQuery() {
	useFollows();
	return null;
}
```

Render `<SyncFollowsQuery key="syncFollows" />`.

- [ ] **Step 2: Replace subscription manager stale handling**

In `subscriptions-manager-wrapper.tsx`, replace `markFollowsAsStale()` dispatch on unmount with:

```ts
const queryClient = useQueryClient();
useEffect( () => {
	return () => {
		queryClient.invalidateQueries( { queryKey: getFollowsQueryKey() } );
	};
}, [ queryClient ] );
```

- [ ] **Step 3: Replace onboarding RSM refresh hook**

In `use-refresh-following-streams.ts`, replace `dispatch( requestFollows() )` with:

```ts
const queryClient = useQueryClient();
queryClient.invalidateQueries( { queryKey: getFollowsQueryKey() } );
```

Update the test to mock a QueryClient and assert `invalidateQueries`.

- [ ] **Step 4: Verify and commit**

Run:

```bash
yarn test-client client/reader/components/reader-main client/reader/site-subscriptions-manager client/reader/onboarding-rsm/test/use-refresh-following-streams.test.ts
```

Expected: PASS.

Commit:

```bash
git add client/reader/components/reader-main client/reader/site-subscriptions-manager client/reader/onboarding-rsm
git commit -m "Follows: replace follows sync refreshes"
```

---

## Task 9: Replace Seen/Unseen Data-Layer Refreshes

**Files:**
- Modify: `client/state/data-layer/wpcom/seen-posts/seen/new/index.js`
- Modify: `client/state/data-layer/wpcom/seen-posts/seen/blog/new/index.js`
- Modify: `client/state/data-layer/wpcom/seen-posts/seen/blog/delete/index.js`
- Modify: `client/state/data-layer/wpcom/seen-posts/seen/all/new/index.js`
- Modify: `client/state/data-layer/wpcom/seen-posts/seen/delete/index.js`
- Modify tests in adjacent `test/index.js` files.

- [ ] **Step 1: Replace `requestFollows()` dispatches**

In each file, remove:

```js
import { requestFollows } from 'calypso/state/reader/follows/actions';
```

Add:

```js
import { getFollowsQueryKey } from '@automattic/api-queries';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
```

Replace:

```js
dispatch( requestFollows() );
```

with:

```js
getCalypsoQueryClient()?.invalidateQueries( { queryKey: getFollowsQueryKey() } );
```

- [ ] **Step 2: Update tests**

Mock:

```js
jest.mock( 'calypso/state/query-client', () => ( {
	getCalypsoQueryClient: jest.fn(),
} ) );
```

Assert:

```js
expect( invalidateQueries ).toHaveBeenCalledWith( { queryKey: [ 'read', 'follows' ] } );
```

- [ ] **Step 3: Verify and commit**

Run:

```bash
yarn test-client client/state/data-layer/wpcom/seen-posts
```

Expected: PASS.

Commit:

```bash
git add client/state/data-layer/wpcom/seen-posts
git commit -m "Follows: invalidate follows query after seen changes"
```

---

## Task 10: Remove Legacy Redux Follows and Data-Layer

**Files:**
- Delete: `client/state/reader/follows/**`
- Delete: `client/components/data/sync-reader-follows/index.js`
- Delete: `client/state/selectors/should-sync-reader-follows.js`
- Delete: `client/state/selectors/test/should-sync-reader-follows.js`
- Delete: `client/state/selectors/test/get-reader-follows.js`
- Delete: `client/state/selectors/test/is-following.js`
- Delete: `client/state/selectors/test/get-reader-aliased-follow-feed-url.js`
- Delete: `client/state/data-layer/wpcom/read/following/mine/**`
- Delete: `client/state/data-layer/wpcom/read/site/comment-email-subscriptions/**`
- Delete: `client/state/data-layer/wpcom/read/site/post-email-subscriptions/**`
- Delete: `client/state/data-layer/wpcom/read/sites/notification-subscriptions/**`
- Modify: `client/state/reader/action-types.ts`
- Modify: `client/state/reader/reducer.ts`

- [ ] **Step 1: Confirm no production imports remain**

Run:

```bash
rg -n "calypso/state/reader/follows|SyncReaderFollows|shouldSyncReaderFollows|requestFollows\\(|markFollowsAsStale|READER_FOLLOW|READER_UNFOLLOW|READER_FOLLOWS" client packages
```

Expected: only files listed for deletion and action types listed for removal.

- [ ] **Step 2: Remove reducer and action types**

In `client/state/reader/reducer.ts`, remove the `follows` import and the `follows` key from `combineReducers`.

In `client/state/reader/action-types.ts`, remove:

```ts
export const READER_FOLLOW = 'READER_FOLLOW';
export const READER_FOLLOW_COMPLETE = 'READER_FOLLOW_COMPLETE';
export const READER_FOLLOW_ERROR = 'READER_FOLLOW_ERROR';
export const READER_FOLLOWS_MARK_AS_STALE = 'READER_FOLLOWS_MARK_AS_STALE';
export const READER_FOLLOWS_RECEIVE = 'READER_FOLLOWS_RECEIVE';
export const READER_FOLLOWS_SYNC_COMPLETE = 'READER_FOLLOWS_SYNC_COMPLETE';
export const READER_FOLLOWS_SYNC_PAGE = 'READER_FOLLOWS_SYNC_PAGE';
export const READER_FOLLOWS_SYNC_START = 'READER_FOLLOWS_SYNC_START';
export const READER_UNFOLLOW = 'READER_UNFOLLOW';
export const READER_SUBSCRIBE_TO_NEW_POST_EMAIL = 'READER_SUBSCRIBE_TO_NEW_POST_EMAIL';
export const READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL = 'READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL';
export const READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION = 'READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION';
export const READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL = 'READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL';
export const READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL = 'READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL';
export const READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS = 'READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS';
export const READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS = 'READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS';
```

- [ ] **Step 3: Delete files**

```bash
git rm -r client/state/reader/follows
git rm client/components/data/sync-reader-follows/index.js
git rm client/state/selectors/should-sync-reader-follows.js
git rm client/state/selectors/test/should-sync-reader-follows.js
git rm client/state/selectors/test/get-reader-follows.js
git rm client/state/selectors/test/is-following.js
git rm client/state/selectors/test/get-reader-aliased-follow-feed-url.js
git rm -r client/state/data-layer/wpcom/read/following/mine
git rm -r client/state/data-layer/wpcom/read/site/comment-email-subscriptions
git rm -r client/state/data-layer/wpcom/read/site/post-email-subscriptions
git rm -r client/state/data-layer/wpcom/read/sites/notification-subscriptions
```

- [ ] **Step 4: Verify stale imports**

Run:

```bash
rg -n "calypso/state/reader/follows|SyncReaderFollows|shouldSyncReaderFollows|requestFollows\\(|markFollowsAsStale|READER_FOLLOW|READER_UNFOLLOW|READER_FOLLOWS|READER_SUBSCRIBE_TO_NEW_POST_EMAIL|READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL|READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION|READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL|READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL|READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS|READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS" client packages
```

Expected: no results.

- [ ] **Step 5: Verify and commit**

Run:

```bash
yarn test-client client/state/reader client/state/data-layer/wpcom/read client/reader client/blocks
```

Expected: PASS.

Commit:

```bash
git add -u client/state/reader client/state/data-layer/wpcom/read client/state/selectors client/components/data client/reader client/blocks
git commit -m "Follows: remove legacy follows Redux layer"
```

---

## Task 11: Documentation and Final Verification

**Files:**
- Modify: `client/reader/AGENTS.md`

- [ ] **Step 1: Document the new follows layer**

Add under `Data fetching migration` in `client/reader/AGENTS.md`:

```md
Follows are backed by React Query via `@automattic/api-core/src/read-follows`,
`@automattic/api-queries/src/read-follows.ts`, and `client/reader/data/follows`.
Do not add new consumers of `state.reader.follows`; that Redux slice has been removed.
Selector hooks in `client/reader/data/follows` must derive from `useFollows()`
or another subscribed query hook so components re-render when follows cache changes.
The `useFollows()` hook owns full pagination sync for `/read/following/mine`.
Follow/unfollow and delivery-method mutations must receive the active Calypso
`QueryClient` through `useQueryClient()` and coordinate read-site, following-stream,
and subscription-manager invalidation through `client/reader/data/follows/cache.ts`.
```

- [ ] **Step 2: Run final targeted tests**

```bash
yarn test-packages packages/api-queries/src/__tests__/read-follows.test.tsx
yarn test-client client/reader/data/follows
yarn test-client client/reader/onboarding-rsm client/reader/new-subscription client/reader/sidebar client/reader/stream
yarn test-client client/blocks/follow-button client/blocks/reader-site-notification-settings
```

Expected: PASS.

- [ ] **Step 3: Run required pre-PR typecheck**

```bash
yarn typecheck-client
```

Expected: PASS.

- [ ] **Step 4: Run stale import search**

```bash
rg -n "calypso/state/reader/follows|SyncReaderFollows|shouldSyncReaderFollows|requestFollows\\(|markFollowsAsStale|READER_FOLLOW|READER_UNFOLLOW|READER_FOLLOWS|READER_SUBSCRIBE_TO_NEW_POST_EMAIL|READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL|READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION|READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL|READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL|READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS|READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS" client packages
```

Expected: no results.

- [ ] **Step 5: Commit docs**

```bash
git add client/reader/AGENTS.md
git commit -m "Follows: document follows query migration"
```

---

## Completion Criteria

- React Query is the only source of truth for follows in the Reader experience.
- `useFollows()` fetches every page up to the legacy 2000-item cap.
- Selector hooks are reactive and re-render when query cache data changes.
- Follow/unfollow preserve alias behavior and update read-site/subscription caches.
- Delivery mutations use the same API versions/namespaces as the removed data-layer.
- No production imports reference `calypso/state/reader/follows`.
- No follows action types remain in `client/state/reader/action-types.ts`.
- Final stale import search returns no results.
- `yarn typecheck-client` passes.
