import { fetchReadSpaces } from '../fetchers';

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
} );
