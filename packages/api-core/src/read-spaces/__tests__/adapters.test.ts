import { adaptReadSpace, adaptReadSpaceDetails, type ReadSpaceApiItem } from '../adapters';

const wireSpace = ( overrides: Partial< ReadSpaceApiItem > = {} ): ReadSpaceApiItem => ( {
	id: 3,
	title: 'Work',
	layout: { color: 'blue', icon: 'inbox' },
	...overrides,
} );

const wireFollow = {
	feed_id: 9981,
	feed_url: 'https://en.blog/feed/',
	blog_id: 3584907,
	name: 'The WordPress.com Blog',
	icon: 'https://example.com/blavatar.png',
};

describe( 'read spaces adapters', () => {
	describe( 'adaptReadSpace (summary)', () => {
		it( 'maps the wire fields onto the client ReadSpace shape', () => {
			expect( adaptReadSpace( wireSpace() ) ).toEqual( {
				id: '3',
				name: 'Work',
				layout: { color: 'blue', icon: 'inbox' },
			} );
		} );

		it( 'stringifies the numeric id', () => {
			expect( adaptReadSpace( wireSpace( { id: 42 } ) ).id ).toBe( '42' );
		} );

		it( 'maps the layout object through', () => {
			const { layout } = adaptReadSpace(
				wireSpace( { layout: { color: 'celadon', icon: 'star' } } )
			);

			expect( layout ).toEqual( { color: 'celadon', icon: 'star' } );
			expect( layout ).not.toHaveProperty( 'view' );
		} );

		it( 'passes through the optional feed layout view when present', () => {
			const { layout } = adaptReadSpace(
				wireSpace( { layout: { color: 'celadon', icon: 'star', view: 'gallery' } } )
			);

			expect( layout ).toEqual( { color: 'celadon', icon: 'star', view: 'gallery' } );
		} );

		it( 'passes through the optional column width when present', () => {
			const { layout } = adaptReadSpace(
				wireSpace( { layout: { color: 'celadon', icon: 'star', width: 'regular' } } )
			);

			expect( layout ).toEqual( { color: 'celadon', icon: 'star', width: 'regular' } );
		} );

		it( 'omits the column width when absent', () => {
			const { layout } = adaptReadSpace( wireSpace() );

			expect( layout ).not.toHaveProperty( 'width' );
		} );

		it( 'carries neither sources nor tags on the summary shape', () => {
			const summary = adaptReadSpace( wireSpace() );
			expect( summary ).not.toHaveProperty( 'sources' );
			expect( summary ).not.toHaveProperty( 'tags' );
		} );
	} );

	describe( 'adaptReadSpaceDetails', () => {
		it( 'maps the wire follows array onto sources and carries tags', () => {
			expect(
				adaptReadSpaceDetails(
					wireSpace( {
						follows: [ wireFollow ],
						tags: [ 'photography', 'travel' ],
						languages: [ 'en', 'pt' ],
					} )
				)
			).toEqual( {
				id: '3',
				name: 'Work',
				layout: { color: 'blue', icon: 'inbox' },
				tags: [ 'photography', 'travel' ],
				languages: [ 'en', 'pt' ],
				sources: [
					{
						feedId: 9981,
						feedUrl: 'https://en.blog/feed/',
						blogId: 3584907,
						name: 'The WordPress.com Blog',
						siteIcon: 'https://example.com/blavatar.png',
					},
				],
			} );
		} );

		it( 'keeps a null blog_id and null name/icon (external feeds)', () => {
			const [ source ] = adaptReadSpaceDetails(
				wireSpace( {
					follows: [
						{
							feed_id: 9982,
							feed_url: 'https://www.reddit.com/r/x/.rss',
							blog_id: null,
							name: null,
							icon: null,
						},
					],
				} )
			).sources;

			expect( source ).toEqual( {
				feedId: 9982,
				feedUrl: 'https://www.reddit.com/r/x/.rss',
				blogId: null,
				name: null,
				siteIcon: null,
			} );
		} );

		it( 'defaults sources, tags, and languages to empty arrays when absent', () => {
			expect( adaptReadSpaceDetails( wireSpace() ) ).toEqual( {
				id: '3',
				name: 'Work',
				layout: { color: 'blue', icon: 'inbox' },
				sources: [],
				tags: [],
				languages: [],
			} );
		} );
	} );
} );
