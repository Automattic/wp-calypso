import { fetchReadSpace, fetchReadSpaces } from '../fetchers';

// NOTE: these fetchers currently resolve the hard-coded placeholder set with no
// network call, so there's nothing to intercept yet. Once the real list/detail
// endpoints land (RSM-4145) and these issue `wpcom.req` GETs, mock the HTTP
// layer with `nock` — `nock( BASE ).get( '/…/spaces' ).reply( 200, … )` for the
// happy path and a 4xx/5xx reply for the "not found"/error path — instead of
// asserting against the placeholder data. See the sibling
// `read-site-recommendations` / `read-feeds` fetcher tests for the pattern.
describe( 'read spaces fetchers', () => {
	it( 'returns placeholder spaces with opaque stable ids instead of name slugs', async () => {
		const spaces = await fetchReadSpaces();

		expect( spaces ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					id: '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21',
					name: 'Work',
				} ),
				expect.objectContaining( {
					id: '5cc71d31-97d1-4b7d-93c7-42a5ce9d4cf1',
					name: 'Gaming',
				} ),
			] )
		);
		expect( spaces.map( ( space ) => space.id ) ).not.toEqual(
			spaces.map( ( space ) => space.name.toLowerCase() )
		);
	} );

	it( 'omits sources from the list (they belong to the detail endpoint)', async () => {
		const spaces = await fetchReadSpaces();

		expect( spaces[ 0 ] ).not.toHaveProperty( 'sources' );
	} );

	it( 'returns independent copies that cannot mutate the shared placeholders', async () => {
		const first = await fetchReadSpaces();
		first[ 0 ].tags.push( 'mutated' );
		first[ 0 ].layout.color = 'red';

		const second = await fetchReadSpaces();
		expect( second[ 0 ].tags ).toEqual( [] );
		expect( second[ 0 ].layout.color ).not.toBe( 'red' );
	} );

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
