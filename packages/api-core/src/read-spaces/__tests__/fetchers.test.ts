import nock from 'nock';
import { fetchReadSpace, fetchReadSpaces } from '../fetchers';
import type { ReadSpaceApiItem } from '../adapters';

const BASE = 'https://public-api.wordpress.com';

const wireSpace = ( overrides: Partial< ReadSpaceApiItem > = {} ): ReadSpaceApiItem => ( {
	id: 3,
	title: 'Work',
	slug: 'work',
	owner_id: 5107587,
	sites: [ 242260508 ],
	tags: [ 'business' ],
	layout_color: 'blue',
	layout_icon: 'inbox',
	created: '2026-06-09 18:32:27',
	...overrides,
} );

describe( 'read spaces fetchers', () => {
	afterEach( () => nock.cleanAll() );

	describe( 'fetchReadSpaces', () => {
		it( 'fetches the list from the wpcom/v2 endpoint', async () => {
			const scope = nock( BASE ).get( '/wpcom/v2/reader/spaces' ).reply( 200, [ wireSpace() ] );

			await fetchReadSpaces();

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'adapts the snake_case wire item to the client ReadSpace shape', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/spaces' )
				.reply( 200, [
					wireSpace( {
						id: 4,
						title: 'Gaming',
						tags: [ 'games' ],
						layout_color: 'purple',
						layout_icon: 'box',
					} ),
				] );

			const spaces = await fetchReadSpaces();

			expect( spaces ).toEqual( [
				{
					id: '4',
					name: 'Gaming',
					tags: [ 'games' ],
					layout: { color: 'purple', icon: 'box' },
				},
			] );
		} );

		it( 'stringifies the numeric wire id', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/spaces' )
				.reply( 200, [ wireSpace( { id: 42 } ) ] );

			const [ space ] = await fetchReadSpaces();

			expect( space.id ).toBe( '42' );
		} );

		it( 'omits sources from the list (they belong to the detail endpoint)', async () => {
			nock( BASE ).get( '/wpcom/v2/reader/spaces' ).reply( 200, [ wireSpace() ] );

			const [ space ] = await fetchReadSpaces();

			expect( space ).not.toHaveProperty( 'sources' );
		} );

		it( 'returns an empty list when the response is not an array', async () => {
			nock( BASE ).get( '/wpcom/v2/reader/spaces' ).reply( 200, {} );

			await expect( fetchReadSpaces() ).resolves.toEqual( [] );
		} );
	} );

	// The detail endpoint is still a placeholder (RSM-4145) — no network call,
	// resolves from the in-memory set. Update these to nock once it's wired.
	describe( 'fetchReadSpace (placeholder)', () => {
		it( 'resolves a single placeholder space by id, with its sources', async () => {
			await expect( fetchReadSpace( '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21' ) ).resolves.toEqual(
				expect.objectContaining( {
					id: '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21',
					name: 'Work',
					sources: [],
				} )
			);
		} );

		it( 'rejects when the space id is unknown', async () => {
			await expect( fetchReadSpace( 'does-not-exist' ) ).rejects.toThrow( 'Space not found' );
		} );
	} );
} );
