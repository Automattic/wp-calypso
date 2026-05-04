/**
 * @jest-environment node
 */

import { getPackBlogs } from '../get-pack-blogs';
import type { CuratedBlogsList } from '../../curated-blogs';

const makeBlogs = ( prefix: string, count: number ) =>
	Array.from( { length: count }, ( _, i ) => ( {
		feed_ID: parseInt( `${ prefix }${ i + 1 }`, 10 ),
		site_ID: 1000 + parseInt( `${ prefix }${ i + 1 }`, 10 ),
		site_URL: `https://${ prefix }-${ i + 1 }.example`,
		site_name: `${ prefix }-${ i + 1 }`,
	} ) );

const fixture: CuratedBlogsList = {
	food: makeBlogs( '1', 6 ),
	drinks: makeBlogs( '2', 6 ),
	dining: makeBlogs( '3', 6 ),
	travel: makeBlogs( '4', 6 ),
};

// Deterministic "random" that always picks the first remaining element.
const pickFirst = () => 0;

describe( 'getPackBlogs', () => {
	it( 'returns an empty array when no tags are provided', () => {
		expect( getPackBlogs( [], { curatedBlogs: fixture } ) ).toEqual( [] );
	} );

	it( 'returns an empty array when none of the tags have curated entries', () => {
		expect( getPackBlogs( [ 'unknown-1', 'unknown-2' ], { curatedBlogs: fixture } ) ).toEqual( [] );
	} );

	it( 'distributes 5 slots evenly across 3 available tags as [2, 2, 1]', () => {
		const blogs = getPackBlogs( [ 'food', 'drinks', 'dining' ], {
			curatedBlogs: fixture,
			random: pickFirst,
		} );

		expect( blogs ).toHaveLength( 5 );
		// With pickFirst, the first 2 from `food`, first 2 from `drinks`, first 1 from `dining`.
		expect( blogs.map( ( b ) => b.site_name ) ).toEqual( [ '1-1', '1-2', '2-1', '2-2', '3-1' ] );
	} );

	it( 'distributes 5 slots across 2 available tags as [3, 2]', () => {
		const blogs = getPackBlogs( [ 'food', 'drinks' ], {
			curatedBlogs: fixture,
			random: pickFirst,
		} );

		expect( blogs ).toHaveLength( 5 );
		expect( blogs.map( ( b ) => b.site_name ) ).toEqual( [ '1-1', '1-2', '1-3', '2-1', '2-2' ] );
	} );

	it( 'fills entirely from the only available tag when others are missing', () => {
		const blogs = getPackBlogs( [ 'food', 'drinks-missing', 'dining-missing' ], {
			curatedBlogs: { food: fixture.food },
			random: pickFirst,
		} );

		expect( blogs ).toHaveLength( 5 );
		expect( blogs.every( ( b ) => b.site_name.startsWith( '1-' ) ) ).toBe( true );
	} );

	it( 'returns no more than the requested count', () => {
		const blogs = getPackBlogs( [ 'food', 'drinks', 'dining' ], {
			count: 2,
			curatedBlogs: fixture,
			random: pickFirst,
		} );

		expect( blogs ).toHaveLength( 2 );
	} );

	it( 'caps to the available pool size when fewer blogs exist than requested', () => {
		const blogs = getPackBlogs( [ 'tiny' ], {
			curatedBlogs: { tiny: makeBlogs( '5', 2 ) },
			random: pickFirst,
		} );

		expect( blogs ).toHaveLength( 2 );
	} );

	it( 'tops up from other tags when a primary tag has fewer entries than its slot share', () => {
		// `food` has 6, `drinks` only 1 → with [3, 2] distribution drinks would be
		// short. We expect a refill from the larger pool to reach 5.
		const blogs = getPackBlogs( [ 'food', 'drinks' ], {
			curatedBlogs: {
				food: fixture.food,
				drinks: [ fixture.drinks[ 0 ] ],
			},
			random: pickFirst,
		} );

		expect( blogs ).toHaveLength( 5 );
		expect( new Set( blogs.map( ( b ) => b.feed_ID ) ).size ).toBe( 5 );
	} );

	it( 'de-duplicates blogs that appear in multiple tags by feed_ID', () => {
		const shared = fixture.food[ 0 ];
		const blogs = getPackBlogs( [ 'food', 'shared' ], {
			curatedBlogs: {
				food: fixture.food,
				shared: [ shared, ...makeBlogs( '6', 5 ) ],
			},
			random: pickFirst,
		} );

		const feedIds = blogs.map( ( b ) => b.feed_ID );
		expect( new Set( feedIds ).size ).toBe( feedIds.length );
		expect( blogs ).toHaveLength( 5 );
	} );

	it( 'picks up newly-added curated tags dynamically', () => {
		// A tag that was never present before is supplied via custom curatedBlogs;
		// the helper should treat it like any other available tag.
		const blogs = getPackBlogs( [ 'brand-new-tag' ], {
			curatedBlogs: { 'brand-new-tag': makeBlogs( '7', 5 ) },
			random: pickFirst,
		} );

		expect( blogs ).toHaveLength( 5 );
		expect( blogs.every( ( b ) => b.site_name.startsWith( '7-' ) ) ).toBe( true );
	} );

	it( 'is deterministic when given a deterministic random function', () => {
		const a = getPackBlogs( [ 'food', 'drinks', 'dining' ], {
			curatedBlogs: fixture,
			random: pickFirst,
		} );
		const b = getPackBlogs( [ 'food', 'drinks', 'dining' ], {
			curatedBlogs: fixture,
			random: pickFirst,
		} );
		expect( a ).toEqual( b );
	} );
} );
