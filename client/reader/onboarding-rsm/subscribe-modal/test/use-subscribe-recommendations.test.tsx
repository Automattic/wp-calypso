/**
 * @jest-environment jsdom
 */

import { act, waitFor } from '@testing-library/react';
import { getLocaleSlug } from 'i18n-calypso';
import { useFollowedReaderTags } from 'calypso/data/reader/use-reader-tags';
import wpcom from 'calypso/lib/wp';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import {
	useSubscribeRecommendations,
	type CardData,
	type RecommendedBlogsApiSite,
} from '../use-subscribe-recommendations';

/** Controls `readFeedQuery` mock behavior (see `jest.mock( '@automattic/api-queries' )` below). */
const readFeedQueryTestHarness = {
	mode: 'off' as 'off' | 'enrich',
	enrichmentByFeedId: {} as Record< number, { feed_URL: string } >,
};

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

jest.mock( 'calypso/data/reader/use-reader-tags', () => ( {
	useFollowedReaderTags: jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => {
	const actual = jest.requireActual( 'i18n-calypso' );
	return {
		...actual,
		getLocaleSlug: jest.fn( () => 'en' ),
	};
} );

jest.mock( 'calypso/reader/onboarding-rsm/curated-blogs', () => ( {
	curatedBlogs: {
		food: [
			{
				feed_ID: 100,
				site_ID: 0,
				site_URL: 'https://food1.example',
				site_name: 'Food 1',
				feed_URL: 'https://food1.example/feed',
				has_icon: true,
			},
			{
				feed_ID: 101,
				site_ID: 1001,
				site_URL: 'https://food2.example',
				site_name: 'Food 2',
				feed_URL: 'https://food2.example/feed',
				has_icon: true,
			},
		],
		drinks: [
			{
				feed_ID: 200,
				site_ID: 0,
				site_URL: 'https://drinks1.example',
				site_name: 'Drinks 1',
				feed_URL: 'https://drinks1.example/feed',
				has_icon: true,
			},
			{
				feed_ID: 201,
				site_ID: 2001,
				site_URL: 'https://drinks2.example',
				site_name: 'Drinks 2',
				feed_URL: 'https://drinks2.example/feed',
				has_icon: false,
			},
		],
	},
} ) );

// `readFeedQuery` is consumed by `useQueries` to fetch feed metadata and bridge
// it back into Redux. The pinning logic in the hook reads that bridged state
// (or our preloaded `initialState`) to decide whether a card is "validated".
// By default we disable queries so tests that preload Redux stay fast. The
// `enrich` harness enables targeted `readFeedQuery` responses (see feed_URL test).
jest.mock( '@automattic/api-queries', () => {
	const actual = jest.requireActual( '@automattic/api-queries' );
	return {
		...actual,
		readFeedQuery: ( feedId: number ) => {
			const base = actual.readFeedQuery( feedId );
			if ( readFeedQueryTestHarness.mode === 'off' ) {
				return {
					...base,
					queryFn: jest.fn().mockResolvedValue( null ),
					enabled: false,
				};
			}
			const enrichment = readFeedQueryTestHarness.enrichmentByFeedId[ feedId ];
			return {
				...base,
				queryFn: () => Promise.resolve( enrichment != null ? { ...enrichment } : null ),
				enabled: Boolean( enrichment ),
			};
		},
	};
} );

const mockUseFollowedReaderTags = useFollowedReaderTags as jest.MockedFunction<
	typeof useFollowedReaderTags
>;
const mockGetLocaleSlug = getLocaleSlug as jest.MockedFunction< typeof getLocaleSlug >;
const mockGet = jest.mocked( wpcom.req.get );

const tagsLoading = () =>
	( {
		data: undefined,
		isLoading: true,
	} ) as unknown as ReturnType< typeof useFollowedReaderTags >;

const tagsLoaded = ( slugs: string[] ) =>
	( {
		data: slugs.map( ( slug ) => ( { slug } ) ),
		isLoading: false,
	} ) as unknown as ReturnType< typeof useFollowedReaderTags >;

const cardsResponse = ( sites: RecommendedBlogsApiSite[] ) => ( {
	cards: [ { type: 'recommended_blogs', data: sites } ],
} );

interface ReaderState {
	reader: {
		feeds: { items: Record< number, { feed_ID: number; is_error?: boolean } > };
		sites: { items: Record< number, { ID: number; is_error?: boolean } > };
		follows: {
			items: Record<
				string,
				{ feed_ID: number | null; blog_ID: number | null; is_following: boolean }
			>;
		};
	};
}

const buildReaderState = ( overrides: Partial< ReaderState[ 'reader' ] > = {} ): ReaderState => ( {
	reader: {
		feeds: { items: {} },
		sites: { items: {} },
		follows: { items: {} },
		...overrides,
	},
} );

// Test-only action used by the pin-stability test to simulate a follow happening
// from inside the modal (e.g. the user clicking Subscribe on a pinned card) by
// rewriting `state.reader.follows.items`.
const SET_FOLLOWS = '@@TEST/SET_FOLLOWS';

interface SetFollowsAction {
	type: typeof SET_FOLLOWS;
	payload: ReaderState[ 'reader' ][ 'follows' ][ 'items' ];
}

// The Redux root reducer's `combineReducers` strips state for keys without a
// registered reducer, so we register a minimal `reader` reducer that survives
// the initial state and lets the pin-stability test mutate the follows slice.
const readerReducers = {
	reader: (
		state: ReaderState[ 'reader' ] | undefined = buildReaderState().reader,
		action: SetFollowsAction | { type: string }
	): ReaderState[ 'reader' ] => {
		if ( action.type === SET_FOLLOWS ) {
			return { ...state, follows: { items: ( action as SetFollowsAction ).payload } };
		}
		return state;
	},
};

const renderHook = ( initialState: ReaderState = buildReaderState() ) =>
	renderHookWithProvider( () => useSubscribeRecommendations(), {
		initialState,
		reducers: readerReducers,
	} );

beforeEach( () => {
	jest.clearAllMocks();
	readFeedQueryTestHarness.mode = 'off';
	readFeedQueryTestHarness.enrichmentByFeedId = {};
	mockGetLocaleSlug.mockReturnValue( 'en' );
	mockUseFollowedReaderTags.mockReturnValue( tagsLoaded( [ 'food', 'drinks' ] ) );
	mockGet.mockResolvedValue( cardsResponse( [] ) );
} );

describe( 'useSubscribeRecommendations', () => {
	describe( 'loading states', () => {
		it( 'reports isLoading=true while followed tags are loading', () => {
			mockUseFollowedReaderTags.mockReturnValue( tagsLoading() );

			const { result } = renderHook();

			expect( result.current.isLoading ).toBe( true );
		} );

		it( 'does not flash hasNoRecommendations while tags are still loading', () => {
			// Regression: before plumbing tags-loading state through, the empty-state
			// briefly rendered because `followedTagSlugs = []` disables the API query
			// (so `apiLoading` is false) while tags are still in flight.
			mockUseFollowedReaderTags.mockReturnValue( tagsLoading() );

			const { result } = renderHook();

			expect( result.current.hasNoRecommendations ).toBe( false );
			expect( result.current.combinedRecommendations ).toEqual( [] );
		} );

		it( 'reports hasNoRecommendations once tags load with no curated/api matches', async () => {
			mockUseFollowedReaderTags.mockReturnValue( tagsLoaded( [] ) );

			const { result } = renderHook();

			await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
			expect( result.current.hasNoRecommendations ).toBe( true );
		} );
	} );

	describe( 'combinedRecommendations feed_URL enrichment', () => {
		beforeEach( () => {
			readFeedQueryTestHarness.mode = 'enrich';
			readFeedQueryTestHarness.enrichmentByFeedId = {
				999: { feed_URL: 'https://from-read-feed.example/feed' },
			};
			mockUseFollowedReaderTags.mockReturnValue( tagsLoaded( [ 'not-in-curated-mock' ] ) );
			mockGet.mockResolvedValue(
				cardsResponse( [
					{
						feed_ID: 999,
						site_ID: 0,
						site_URL: 'https://only-api.example',
						site_name: 'API row without feed_URL on cards payload',
					},
				] )
			);
		} );

		it( 'uses readFeedQuery feed_URL when `/read/tags/cards` omits feed_URL', async () => {
			const { result } = renderHook();

			await waitFor( () => {
				const row = result.current.combinedRecommendations.find(
					( s: CardData ) => s.feed_ID === 999
				);
				expect( row?.feed_URL ).toBe( 'https://from-read-feed.example/feed' );
			} );
		} );
	} );

	describe( 'combinedRecommendations ordering', () => {
		it( 'round-robin interleaves curated blogs across followed tags', async () => {
			const { result } = renderHook();

			await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

			expect( result.current.combinedRecommendations.map( ( s: CardData ) => s.feed_ID ) ).toEqual(
				[ 100, 200, 101, 201 ]
			);
		} );

		it( 'skips curated entries entirely for non-English locales', async () => {
			mockGetLocaleSlug.mockReturnValue( 'fr' );
			mockGet.mockResolvedValue(
				cardsResponse( [
					{
						feed_ID: 999,
						site_ID: 9999,
						site_URL: 'https://api.example',
						site_name: 'API only',
						feed_URL: 'https://api.example/feed',
					},
				] )
			);

			const { result } = renderHook();

			await waitFor( () =>
				expect(
					result.current.combinedRecommendations.map( ( s: CardData ) => s.feed_ID )
				).toEqual( [ 999 ] )
			);
		} );

		it( 'promotes cross-source duplicates by summing weights', async () => {
			// `feed_ID: 100` lives in curated `food` AND comes back from the API,
			// so its summed weight is 2 and it should outrank weight-1 entries.
			mockGet.mockResolvedValue(
				cardsResponse( [
					{
						feed_ID: 100,
						site_ID: 0,
						site_URL: 'https://food1.example',
						site_name: 'Food 1 (api copy)',
						feed_URL: 'https://food1.example/feed',
					},
					{
						feed_ID: 999,
						site_ID: 9999,
						site_URL: 'https://api.example',
						site_name: 'API only',
						feed_URL: 'https://api.example/feed',
					},
				] )
			);

			const { result } = renderHook();

			await waitFor( () =>
				expect( result.current.combinedRecommendations.length ).toBeGreaterThan( 0 )
			);

			expect( result.current.combinedRecommendations[ 0 ].feed_ID ).toBe( 100 );
		} );

		it( 'dedupes by feed_ID, keeping the curated copy on cross-source collisions', async () => {
			mockGet.mockResolvedValue(
				cardsResponse( [
					{
						feed_ID: 200,
						site_ID: 0,
						site_URL: 'https://drinks1-api.example',
						site_name: 'Drinks 1 (api copy)',
						feed_URL: 'https://drinks1-api.example/feed',
					},
				] )
			);

			const { result } = renderHook();

			await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

			const matches = result.current.combinedRecommendations.filter(
				( s: CardData ) => s.feed_ID === 200
			);
			expect( matches ).toHaveLength( 1 );
			expect( matches[ 0 ].site_name ).toBe( 'Drinks 1' );
		} );
	} );

	describe( 'exclusion of already-followed sites', () => {
		it( 'excludes feeds the user already follows by feed_ID', async () => {
			const state = buildReaderState( {
				follows: {
					items: {
						'https://food1.example': {
							feed_ID: 100,
							blog_ID: null,
							is_following: true,
						},
					},
				},
			} );

			const { result } = renderHook( state );

			await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

			expect(
				result.current.combinedRecommendations.map( ( s: CardData ) => s.feed_ID )
			).not.toContain( 100 );
		} );

		it( 'excludes feeds the user already follows by blog_ID matching site_ID', async () => {
			const state = buildReaderState( {
				follows: {
					items: {
						'https://food2.example': {
							feed_ID: null,
							blog_ID: 1001,
							is_following: true,
						},
					},
				},
			} );

			const { result } = renderHook( state );

			await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

			// `feed_ID: 101` corresponds to `site_ID: 1001`, which is in the follows map.
			expect(
				result.current.combinedRecommendations.map( ( s: CardData ) => s.feed_ID )
			).not.toContain( 101 );
		} );
	} );

	describe( 'pinning (recommendations buffer)', () => {
		const flushEffects = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		it( 'pins a card with site_ID === 0 once feed metadata is loaded', async () => {
			const state = buildReaderState( {
				feeds: { items: { 100: { feed_ID: 100 } } },
			} );

			const { result } = renderHook( state );

			await waitFor( () =>
				expect( result.current.recommendations.map( ( s: CardData ) => s.feed_ID ) ).toContain(
					100
				)
			);
		} );

		it( 'does NOT pin a card with site_ID > 0 until the site is also loaded', async () => {
			// Regression for Copilot review: previously a missing site record was
			// treated as "OK" and the card was pinned before the site had a chance
			// to resolve to an error.
			const state = buildReaderState( {
				feeds: { items: { 101: { feed_ID: 101 } } },
				// Note: no entry for site_ID 1001 yet.
			} );

			const { result } = renderHook( state );

			await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
			await flushEffects();

			expect( result.current.recommendations.map( ( s: CardData ) => s.feed_ID ) ).not.toContain(
				101
			);
		} );

		it( 'pins a card with site_ID > 0 once both feed AND site are loaded', async () => {
			const state = buildReaderState( {
				feeds: { items: { 101: { feed_ID: 101 } } },
				sites: { items: { 1001: { ID: 1001 } } },
			} );

			const { result } = renderHook( state );

			await waitFor( () =>
				expect( result.current.recommendations.map( ( s: CardData ) => s.feed_ID ) ).toContain(
					101
				)
			);
		} );

		it( 'excludes a card whose feed loaded with an error', async () => {
			const state = buildReaderState( {
				feeds: { items: { 100: { feed_ID: 100, is_error: true } } },
			} );

			const { result } = renderHook( state );

			await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
			await flushEffects();

			expect( result.current.recommendations.map( ( s: CardData ) => s.feed_ID ) ).not.toContain(
				100
			);
		} );

		it( 'excludes a card whose site loaded with an error', async () => {
			const state = buildReaderState( {
				feeds: { items: { 101: { feed_ID: 101 } } },
				sites: { items: { 1001: { ID: 1001, is_error: true } } },
			} );

			const { result } = renderHook( state );

			await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
			await flushEffects();

			expect( result.current.recommendations.map( ( s: CardData ) => s.feed_ID ) ).not.toContain(
				101
			);
		} );

		it( 'falls through to hasNoRecommendations when every candidate fails validation', async () => {
			// All four candidates load with feed errors. Without the rejected-set
			// tracking, `pinnedSites` would stay empty, `isValidating` would be
			// stuck `true`, and the loading placeholder would render forever.
			const state = buildReaderState( {
				feeds: {
					items: {
						100: { feed_ID: 100, is_error: true },
						101: { feed_ID: 101, is_error: true },
						200: { feed_ID: 200, is_error: true },
						201: { feed_ID: 201, is_error: true },
					},
				},
			} );

			const { result } = renderHook( state );

			await waitFor( () => expect( result.current.hasNoRecommendations ).toBe( true ) );
			expect( result.current.isValidating ).toBe( false );
			expect( result.current.recommendations ).toEqual( [] );
		} );

		it( 'falls through to hasNoRecommendations when feed and site errors cover every candidate', async () => {
			// Mixed terminal failures: site_ID === 0 candidates fail at the feed
			// step, site_ID > 0 candidates fail at the site step. Either way the
			// hook should treat all four as settled and surface the empty state.
			const state = buildReaderState( {
				feeds: {
					items: {
						100: { feed_ID: 100, is_error: true },
						101: { feed_ID: 101 },
						200: { feed_ID: 200, is_error: true },
						201: { feed_ID: 201 },
					},
				},
				sites: {
					items: {
						1001: { ID: 1001, is_error: true },
						2001: { ID: 2001, is_error: true },
					},
				},
			} );

			const { result } = renderHook( state );

			await waitFor( () => expect( result.current.hasNoRecommendations ).toBe( true ) );
			expect( result.current.isValidating ).toBe( false );
		} );

		it( 'stays in isValidating while at least one candidate is still pending', async () => {
			// Three feeds error, one is missing entirely (still pending). We
			// should remain in the validating state rather than collapsing to
			// the empty state prematurely.
			const state = buildReaderState( {
				feeds: {
					items: {
						100: { feed_ID: 100, is_error: true },
						200: { feed_ID: 200, is_error: true },
						201: { feed_ID: 201, is_error: true },
						// 101 intentionally absent.
					},
				},
			} );

			const { result } = renderHook( state );

			await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
			// Allow the rejection effect to flush.
			await waitFor( () => expect( result.current.isValidating ).toBe( true ) );
			expect( result.current.hasNoRecommendations ).toBe( false );
		} );

		it( 'shows the pinned subset (not the empty state) when some candidates pin and others fail', async () => {
			// 100 pins (feed loaded, site_ID 0), the other three error out. We
			// should expose the pin in `recommendations` and not flip into the
			// empty state.
			const state = buildReaderState( {
				feeds: {
					items: {
						100: { feed_ID: 100 },
						101: { feed_ID: 101, is_error: true },
						200: { feed_ID: 200, is_error: true },
						201: { feed_ID: 201, is_error: true },
					},
				},
			} );

			const { result } = renderHook( state );

			await waitFor( () =>
				expect( result.current.recommendations.map( ( s: CardData ) => s.feed_ID ) ).toEqual( [
					100,
				] )
			);
			expect( result.current.hasNoRecommendations ).toBe( false );
			expect( result.current.isValidating ).toBe( false );
		} );

		it( 'does not prematurely settle when stale rejections drop out of the candidate set', async () => {
			// Regression test for an over-eager `allCandidatesSettled`:
			//   1. Mount with feed errors for 100 and 200; 101 and 201 are still
			//      pending (no Redux feed entry yet). All four are candidates.
			//   2. Paginated follows arrive marking 100, 101, and 200 as already
			//      followed, so `combinedRecommendations` shrinks to just [201].
			//
			// A naive `pinned + rejected >= length` count would flip
			// `allCandidatesSettled` true here (rejectedFeedIds.size === 2 >=
			// combinedRecommendations.length === 1), incorrectly surfacing the
			// empty state while feed 201 is still genuinely pending.
			const state = buildReaderState( {
				feeds: {
					items: {
						100: { feed_ID: 100, is_error: true },
						200: { feed_ID: 200, is_error: true },
						// 101 and 201 intentionally absent — still pending.
					},
				},
			} );

			const { result, store } = renderHook( state );

			await waitFor( () => expect( result.current.isValidating ).toBe( true ) );

			act( () => {
				store.dispatch( {
					type: SET_FOLLOWS,
					payload: {
						'https://food1.example': {
							feed_ID: 100,
							blog_ID: null,
							is_following: true,
						},
						'https://food2.example': {
							feed_ID: 101,
							blog_ID: null,
							is_following: true,
						},
						'https://drinks1.example': {
							feed_ID: 200,
							blog_ID: null,
							is_following: true,
						},
					},
				} );
			} );

			await waitFor( () =>
				expect(
					result.current.combinedRecommendations.map( ( s: CardData ) => s.feed_ID )
				).toEqual( [ 201 ] )
			);

			// 201 is still genuinely pending — not pinned, not rejected — so we
			// must remain in the validating state, not collapse to empty.
			expect( result.current.isValidating ).toBe( true );
			expect( result.current.hasNoRecommendations ).toBe( false );
		} );

		it( 'keeps a session-followed pinned card visible after the follows slice catches up', async () => {
			// Pin order: feed 100 (site_ID 0) is pinned on feed alone.
			const state = buildReaderState( {
				feeds: { items: { 100: { feed_ID: 100 } } },
			} );

			const { result, store } = renderHook( state );

			await waitFor( () =>
				expect( result.current.recommendations.map( ( s: CardData ) => s.feed_ID ) ).toContain(
					100
				)
			);

			// Simulate the user clicking subscribe inside the modal: the follow
			// button's `onFollowToggle( isFollowing: true )` would call this.
			act( () => {
				result.current.markSessionFollow( 100 );
			} );

			// And the follows slice updates as a result. `combinedRecommendations`
			// recomputes to exclude 100, but because 100 was followed in-session
			// the pinned buffer keeps the card rendered with its "Subscribed" state.
			act( () => {
				store.dispatch( {
					type: SET_FOLLOWS,
					payload: {
						'https://food1.example': {
							feed_ID: 100,
							blog_ID: null,
							is_following: true,
						},
					},
				} );
			} );

			await waitFor( () =>
				expect(
					result.current.combinedRecommendations.map( ( s: CardData ) => s.feed_ID )
				).not.toContain( 100 )
			);
			expect( result.current.recommendations.map( ( s: CardData ) => s.feed_ID ) ).toContain( 100 );
		} );

		it( 'prunes a pinned card once paginated follows reveal it was already subscribed', async () => {
			// Regression: without pruning, a feed pinned before its already-followed
			// status is known would persist as a "recommendation" with a misleading
			// "Subscribed" badge — which directly contradicts the PR's goal of not
			// recommending blogs the user already follows.
			const state = buildReaderState( {
				feeds: { items: { 100: { feed_ID: 100 } } },
			} );

			const { result, store } = renderHook( state );

			await waitFor( () =>
				expect( result.current.recommendations.map( ( s: CardData ) => s.feed_ID ) ).toContain(
					100
				)
			);

			// Paginated follows arrive with feed 100 in them — but the user did
			// NOT follow it inside the modal, so it should be pruned.
			act( () => {
				store.dispatch( {
					type: SET_FOLLOWS,
					payload: {
						'https://food1.example': {
							feed_ID: 100,
							blog_ID: null,
							is_following: true,
						},
					},
				} );
			} );

			await waitFor( () =>
				expect( result.current.recommendations.map( ( s: CardData ) => s.feed_ID ) ).not.toContain(
					100
				)
			);
		} );

		it( 'prunes a pinned card when paginated follows reveal a matching blog_ID', async () => {
			// Same regression as above but discovered via blog_ID/site_ID match
			// rather than feed_ID. Feed 101 has site_ID 1001 in our fixtures.
			const state = buildReaderState( {
				feeds: { items: { 101: { feed_ID: 101 } } },
				sites: { items: { 1001: { ID: 1001 } } },
			} );

			const { result, store } = renderHook( state );

			await waitFor( () =>
				expect( result.current.recommendations.map( ( s: CardData ) => s.feed_ID ) ).toContain(
					101
				)
			);

			act( () => {
				store.dispatch( {
					type: SET_FOLLOWS,
					payload: {
						'https://food2.example': {
							feed_ID: null,
							blog_ID: 1001,
							is_following: true,
						},
					},
				} );
			} );

			await waitFor( () =>
				expect( result.current.recommendations.map( ( s: CardData ) => s.feed_ID ) ).not.toContain(
					101
				)
			);
		} );
	} );
} );
