/**
 * @jest-environment node
 */
import {
	PER_FETCH,
	PER_POLL,
	QUERY_META,
	SITE_LIMITER_FIELDS,
	analyticsForStream,
	createStreamDataFromPosts,
	createStreamItemFromPost,
	extractPageHandle,
	getAlgorithmForStream,
	getQueryString,
	getQueryStringForPoll,
} from '../normalize';

describe( 'getQueryString', () => {
	it( 'sets default orderBy/meta/content_width', () => {
		expect( getQueryString() ).toEqual( {
			orderBy: 'date',
			meta: QUERY_META,
			content_width: 675,
		} );
	} );

	it( 'merges extras while keeping content_width as the last word', () => {
		expect( getQueryString( { number: 7, lang: 'en', content_width: 100 } ) ).toEqual( {
			orderBy: 'date',
			meta: QUERY_META,
			number: 7,
			lang: 'en',
			content_width: 675,
		} );
	} );
} );

describe( 'getQueryStringForPoll', () => {
	it( 'returns the poll query with site-limiter fields by default', () => {
		expect( getQueryStringForPoll() ).toEqual( {
			orderBy: 'date',
			number: PER_POLL,
			fields: SITE_LIMITER_FIELDS.join( ',' ),
		} );
	} );

	it( 'appends extra fields and merges extra query params', () => {
		expect( getQueryStringForPoll( [ 'date_liked' ], { index: 'a8c' } ) ).toEqual( {
			orderBy: 'date',
			number: PER_POLL,
			fields: [ ...SITE_LIMITER_FIELDS, 'date_liked' ].join( ',' ),
			index: 'a8c',
		} );
	} );
} );

describe( 'createStreamItemFromPost', () => {
	it( 'maps a blog post to a stream item with blogId/postId', () => {
		const item = createStreamItemFromPost(
			{
				ID: 10,
				site_ID: 200,
				date: '2026-01-01',
				URL: 'https://example.com/p',
				site_name: 'Example',
				site_icon: { ico: 'icon.png' },
				description: 'desc',
				feed_URL: 'https://example.com/feed',
				feed_ID: 999,
			},
			'date'
		);

		expect( item ).toMatchObject( {
			blogId: 200,
			postId: 10,
			date: '2026-01-01',
			url: 'https://example.com/p',
			site_name: 'Example',
			site_icon: 'icon.png',
			site_description: 'desc',
			feed_URL: 'https://example.com/feed',
			feed_ID: 999,
		} );
	} );

	it( 'derives the date from the requested dateProperty', () => {
		const item = createStreamItemFromPost(
			{ ID: 1, site_ID: 2, date_liked: '2026-02-02' },
			'date_liked'
		);
		expect( item.date ).toBe( '2026-02-02' );
	} );

	it( 'reverses comment IDs (newest first) when present', () => {
		const item = createStreamItemFromPost(
			{ ID: 1, site_ID: 2, comments: [ { ID: 1 }, { ID: 2 }, { ID: 3 } ] },
			'date'
		);
		expect( item.comments ).toEqual( [ 3, 2, 1 ] );
	} );

	it( 'omits comments when not provided', () => {
		const item = createStreamItemFromPost( { ID: 1, site_ID: 2 }, 'date' );
		expect( item.comments ).toBeUndefined();
	} );
} );

describe( 'createStreamDataFromPosts', () => {
	it( 'returns empty arrays for null/undefined input', () => {
		expect( createStreamDataFromPosts( null, 'date' ) ).toEqual( {
			streamItems: [],
			streamPosts: [],
		} );
		expect( createStreamDataFromPosts( undefined, 'date' ) ).toEqual( {
			streamItems: [],
			streamPosts: [],
		} );
	} );

	it( 'maps each post and returns the original posts as streamPosts', () => {
		const posts = [
			{ ID: 1, site_ID: 10, date: 'a' },
			{ ID: 2, site_ID: 10, date: 'b' },
		];
		const result = createStreamDataFromPosts( posts, 'date' );
		expect( result.streamItems ).toHaveLength( 2 );
		expect( result.streamItems[ 0 ] ).toMatchObject( { blogId: 10, postId: 1, date: 'a' } );
		expect( result.streamPosts ).toBe( posts );
	} );
} );

describe( 'analyticsForStream', () => {
	it( 'returns no actions when streamKey, algorithm, or items are missing', () => {
		expect( analyticsForStream( {} ) ).toEqual( [] );
		expect( analyticsForStream( { streamKey: 'k', algorithm: 'a' } ) ).toEqual( [] );
		expect( analyticsForStream( { streamKey: 'k', items: [] } ) ).toEqual( [] );
	} );

	it( 'emits one recordTracksEvent per railcar item, ignoring items without a railcar', () => {
		const actions = analyticsForStream( {
			streamKey: 'following',
			algorithm: 'algo/1',
			items: [ { railcar: { id: 'r1' } }, {}, { railcar: { id: 'r2' } } ],
		} );
		expect( actions ).toHaveLength( 2 );
		actions.forEach( ( a ) =>
			expect( a ).toMatchObject( { type: expect.stringMatching( /ANALYTICS/ ) } )
		);
	} );

	it( 'remembers the last algorithm seen for a streamKey via getAlgorithmForStream', () => {
		analyticsForStream( {
			streamKey: 'following:algo-cache-test',
			algorithm: 'algo/v2',
			items: [ { railcar: {} } ],
		} );
		expect( getAlgorithmForStream( 'following:algo-cache-test' ) ).toBe( 'algo/v2' );
	} );
} );

describe( 'extractPageHandle', () => {
	const noAction = { payload: {} };

	it( 'returns null when nothing in the response signals pagination', () => {
		expect( extractPageHandle( 'following', noAction, {} ) ).toBeNull();
	} );

	it( 'prefers next_page_handle over every other branch', () => {
		expect(
			extractPageHandle( 'following', noAction, {
				next_page_handle: 'NPH',
				next_page: 'NP',
				meta: { next_page: 'META' },
				date_range: { after: '2026-01-01' },
			} )
		).toEqual( { page_handle: 'NPH' } );
	} );

	it( 'returns an offset when streamType contains "rec" (recommendations family)', () => {
		expect(
			extractPageHandle( 'recommendations_posts', noAction, { date_range: { after: 'X' } } )
		).toEqual( { offset: PER_FETCH } );
	} );

	it( 'increments the existing offset for the recommendations family', () => {
		expect(
			extractPageHandle(
				'custom_recs_posts_with_images',
				{ payload: { pageHandle: { offset: 14 } } },
				{}
			)
		).toEqual( { offset: 14 + PER_FETCH } );
	} );

	it( 'falls back to next_page when present', () => {
		expect( extractPageHandle( 'site', noAction, { next_page: 'PAGE2' } ) ).toEqual( {
			page_handle: 'PAGE2',
		} );
	} );

	it( 'falls back to meta.next_page when next_page is absent', () => {
		expect( extractPageHandle( 'site', noAction, { meta: { next_page: 'META2' } } ) ).toEqual( {
			page_handle: 'META2',
		} );
	} );

	it( 'returns { before } from date_range.after as the lowest-priority branch', () => {
		expect(
			extractPageHandle( 'following', noAction, { date_range: { after: '2026-01-01' } } )
		).toEqual( { before: '2026-01-01' } );
	} );
} );
