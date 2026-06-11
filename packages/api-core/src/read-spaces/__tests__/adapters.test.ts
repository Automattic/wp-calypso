import { adaptReadSpace, adaptReadSpaceDetails, type ReadSpaceApiItem } from '../adapters';

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

describe( 'read spaces adapters', () => {
	describe( 'adaptReadSpace', () => {
		it( 'maps the wire fields onto the client ReadSpace shape', () => {
			expect( adaptReadSpace( wireSpace() ) ).toEqual( {
				id: '3',
				name: 'Work',
				tags: [ 'business' ],
				layout: { color: 'blue', icon: 'inbox' },
			} );
		} );

		it( 'stringifies the numeric id', () => {
			expect( adaptReadSpace( wireSpace( { id: 42 } ) ).id ).toBe( '42' );
		} );

		it( 'nests the flat layout_color/layout_icon under layout', () => {
			const { layout } = adaptReadSpace(
				wireSpace( { layout_color: 'celadon', layout_icon: 'star' } )
			);

			expect( layout ).toEqual( { color: 'celadon', icon: 'star' } );
		} );

		it( 'defaults tags to an empty array when absent', () => {
			const item = wireSpace();
			delete ( item as Partial< ReadSpaceApiItem > ).tags;

			expect( adaptReadSpace( item ).tags ).toEqual( [] );
		} );

		it( 'does not carry sources onto the list shape', () => {
			expect( adaptReadSpace( wireSpace() ) ).not.toHaveProperty( 'sources' );
		} );
	} );

	describe( 'adaptReadSpaceDetails', () => {
		it( 'extends the list shape with an empty sources array', () => {
			expect( adaptReadSpaceDetails( wireSpace() ) ).toEqual( {
				id: '3',
				name: 'Work',
				tags: [ 'business' ],
				layout: { color: 'blue', icon: 'inbox' },
				sources: [],
			} );
		} );
	} );
} );
