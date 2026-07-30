import { adaptReadShelf, adaptReadShelfDetails, type ReadShelfApiItem } from '../adapters';

const wireShelf = ( overrides: Partial< ReadShelfApiItem > = {} ): ReadShelfApiItem => ( {
	id: 3,
	slug: 'work',
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

describe( 'read shelves adapters', () => {
	describe( 'adaptReadShelf (summary)', () => {
		it( 'maps the wire fields onto the client ReadShelf shape', () => {
			expect( adaptReadShelf( wireShelf() ) ).toEqual( {
				id: '3',
				slug: 'work',
				name: 'Work',
				layout: { color: 'blue', icon: 'inbox' },
			} );
		} );

		it( 'stringifies the numeric id', () => {
			expect( adaptReadShelf( wireShelf( { id: 42 } ) ).id ).toBe( '42' );
		} );

		it( 'maps the layout object through', () => {
			const { layout } = adaptReadShelf(
				wireShelf( { layout: { color: 'celadon', icon: 'star' } } )
			);

			expect( layout ).toEqual( { color: 'celadon', icon: 'star' } );
			expect( layout ).not.toHaveProperty( 'view' );
		} );

		it( 'passes through the optional feed layout view when present', () => {
			const { layout } = adaptReadShelf(
				wireShelf( { layout: { color: 'celadon', icon: 'star', view: 'gallery' } } )
			);

			expect( layout ).toEqual( { color: 'celadon', icon: 'star', view: 'gallery' } );
		} );

		it( 'passes through the optional column width when present', () => {
			const { layout } = adaptReadShelf(
				wireShelf( { layout: { color: 'celadon', icon: 'star', width: 'regular' } } )
			);

			expect( layout ).toEqual( { color: 'celadon', icon: 'star', width: 'regular' } );
		} );

		it( 'omits the column width when absent', () => {
			const { layout } = adaptReadShelf( wireShelf() );

			expect( layout ).not.toHaveProperty( 'width' );
		} );

		it( 'carries neither sources nor tags on the summary shape', () => {
			const summary = adaptReadShelf( wireShelf() );
			expect( summary ).not.toHaveProperty( 'sources' );
			expect( summary ).not.toHaveProperty( 'tags' );
		} );
	} );

	describe( 'adaptReadShelfDetails', () => {
		it( 'maps the wire follows array onto sources and carries tags', () => {
			expect(
				adaptReadShelfDetails(
					wireShelf( {
						follows: [ wireFollow ],
						tags: [ 'photography', 'travel' ],
						languages: [ 'en', 'pt' ],
					} )
				)
			).toEqual( {
				id: '3',
				slug: 'work',
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
			const [ source ] = adaptReadShelfDetails(
				wireShelf( {
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
			expect( adaptReadShelfDetails( wireShelf() ) ).toEqual( {
				id: '3',
				slug: 'work',
				name: 'Work',
				layout: { color: 'blue', icon: 'inbox' },
				sources: [],
				tags: [],
				languages: [],
			} );
		} );
	} );
} );
