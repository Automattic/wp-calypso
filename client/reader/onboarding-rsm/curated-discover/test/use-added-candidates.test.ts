/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useAddedCandidates } from '../use-added-candidates';
import type { CuratedBlog } from '../../curated-blogs';

const entry = ( feedId: number, overrides: Partial< CuratedBlog > = {} ): CuratedBlog => ( {
	feed_ID: feedId,
	site_ID: 1000 + feedId,
	site_URL: `https://example-${ feedId }.test/`,
	site_name: `Example ${ feedId }`,
	feed_URL: `https://example-${ feedId }.test/feed/`,
	has_icon: true,
	...overrides,
} );

describe( 'useAddedCandidates', () => {
	beforeEach( () => {
		window.localStorage.clear();
	} );

	it( 'starts empty when localStorage is fresh', () => {
		const { result } = renderHook( () => useAddedCandidates( 'society' ) );
		expect( result.current.added ).toEqual( {} );
	} );

	it( 'adds entries under a tag in insertion order', () => {
		const { result } = renderHook( () => useAddedCandidates( 'society' ) );

		act( () => {
			result.current.add( 'education', entry( 1 ) );
			result.current.add( 'education', entry( 2 ) );
		} );

		expect( result.current.added.education?.map( ( e ) => e.feed_ID ) ).toEqual( [ 1, 2 ] );
	} );

	it( 'is idempotent: re-adding the same feed_ID under the same tag is a no-op', () => {
		const { result } = renderHook( () => useAddedCandidates( 'society' ) );

		act( () => {
			result.current.add( 'education', entry( 1 ) );
			result.current.add( 'education', entry( 1, { site_name: 'Should Not Appear' } ) );
		} );

		expect( result.current.added.education ).toHaveLength( 1 );
		// First-write-wins — the second add doesn't overwrite the existing entry.
		expect( result.current.added.education?.[ 0 ].site_name ).toBe( 'Example 1' );
	} );

	it( 'isAdded reflects current state per tag', () => {
		const { result } = renderHook( () => useAddedCandidates( 'society' ) );

		act( () => {
			result.current.add( 'education', entry( 1 ) );
		} );

		expect( result.current.isAdded( 'education', 1 ) ).toBe( true );
		expect( result.current.isAdded( 'education', 99 ) ).toBe( false );
		// Same feed_ID under a different tag is not considered added.
		expect( result.current.isAdded( 'nature', 1 ) ).toBe( false );
	} );

	it( 'remove drops the entry; emptied tags fall out of the map', () => {
		const { result } = renderHook( () => useAddedCandidates( 'society' ) );

		act( () => {
			result.current.add( 'education', entry( 1 ) );
			result.current.add( 'education', entry( 2 ) );
		} );

		act( () => {
			result.current.remove( 'education', 1 );
		} );
		expect( result.current.added.education?.map( ( e ) => e.feed_ID ) ).toEqual( [ 2 ] );

		act( () => {
			result.current.remove( 'education', 2 );
		} );
		expect( result.current.added.education ).toBeUndefined();
		expect( Object.keys( result.current.added ) ).toEqual( [] );
	} );

	it( 'setHasIcon mutates only the matching entry', () => {
		const { result } = renderHook( () => useAddedCandidates( 'society' ) );

		act( () => {
			result.current.add( 'education', entry( 1 ) );
			result.current.add( 'education', entry( 2 ) );
		} );

		act( () => {
			result.current.setHasIcon( 'education', 1, false );
		} );

		expect( result.current.added.education?.find( ( e ) => e.feed_ID === 1 )?.has_icon ).toBe(
			false
		);
		expect( result.current.added.education?.find( ( e ) => e.feed_ID === 2 )?.has_icon ).toBe(
			true
		);
	} );

	it( 'setHasIcon is a no-op for entries that are not in the added set', () => {
		const { result } = renderHook( () => useAddedCandidates( 'society' ) );
		const initialAdded = result.current.added;

		act( () => {
			result.current.setHasIcon( 'education', 99, false );
		} );

		// Same reference (no state update) — the hook short-circuited because
		// the tag wasn't present in the map.
		expect( result.current.added ).toBe( initialAdded );
	} );

	it( 'persists across hook remounts within the same file slug', () => {
		const first = renderHook( () => useAddedCandidates( 'society' ) );

		act( () => {
			first.result.current.add( 'education', entry( 7 ) );
		} );

		first.unmount();

		const second = renderHook( () => useAddedCandidates( 'society' ) );
		expect( second.result.current.added.education?.map( ( e ) => e.feed_ID ) ).toEqual( [ 7 ] );
	} );

	it( 'isolates state per file slug', () => {
		const society = renderHook( () => useAddedCandidates( 'society' ) );
		const lifestyle = renderHook( () => useAddedCandidates( 'lifestyle' ) );

		act( () => {
			society.result.current.add( 'education', entry( 1 ) );
			lifestyle.result.current.add( 'food', entry( 2 ) );
		} );

		expect( society.result.current.added ).toEqual( {
			education: [ entry( 1 ) ],
		} );
		expect( lifestyle.result.current.added ).toEqual( {
			food: [ entry( 2 ) ],
		} );
	} );

	it( 'reloads from storage when the file slug changes mid-render', () => {
		// Seed storage for both files.
		window.localStorage.setItem(
			'reader/curated-discover/added/society',
			JSON.stringify( { education: [ entry( 1 ) ] } )
		);
		window.localStorage.setItem(
			'reader/curated-discover/added/lifestyle',
			JSON.stringify( { food: [ entry( 2 ) ] } )
		);

		const { result, rerender } = renderHook(
			( { slug }: { slug: string } ) => useAddedCandidates( slug ),
			{ initialProps: { slug: 'society' } }
		);

		expect( result.current.added.education ).toBeDefined();

		rerender( { slug: 'lifestyle' } );

		expect( result.current.added.food ).toBeDefined();
		expect( result.current.added.education ).toBeUndefined();
	} );

	it( 'clear empties the entire map for the file', () => {
		const { result } = renderHook( () => useAddedCandidates( 'society' ) );

		act( () => {
			result.current.add( 'education', entry( 1 ) );
			result.current.add( 'nature', entry( 2 ) );
		} );

		act( () => {
			result.current.clear();
		} );

		expect( result.current.added ).toEqual( {} );
	} );

	it( 'tolerates corrupted storage payloads', () => {
		window.localStorage.setItem( 'reader/curated-discover/added/society', 'this is not json' );

		const { result } = renderHook( () => useAddedCandidates( 'society' ) );

		// Corrupted JSON falls back to an empty map; the hook still works.
		expect( result.current.added ).toEqual( {} );
	} );

	it( 'ignores tag entries whose value is not an array of objects', () => {
		window.localStorage.setItem(
			'reader/curated-discover/added/society',
			JSON.stringify( {
				education: 'not an array',
				nature: [ entry( 1 ), null, { not_a_curated_blog: true }, entry( 2 ) ],
			} )
		);

		const { result } = renderHook( () => useAddedCandidates( 'society' ) );

		expect( result.current.added.education ).toBeUndefined();
		expect( result.current.added.nature?.map( ( e ) => e.feed_ID ) ).toEqual( [ 1, 2 ] );
	} );
} );
