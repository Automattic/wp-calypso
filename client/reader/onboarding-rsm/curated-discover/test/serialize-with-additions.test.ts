import { serializeWithAdditions } from '../serialize-with-additions';
import type { CuratedBlog, CuratedBlogsList } from '../../curated-blogs';

const entry = (
	overrides: Partial< CuratedBlog > & Pick< CuratedBlog, 'feed_ID' >
): CuratedBlog => ( {
	site_ID: 1000 + overrides.feed_ID,
	site_URL: `https://example-${ overrides.feed_ID }.test/`,
	site_name: `Example ${ overrides.feed_ID }`,
	feed_URL: `https://example-${ overrides.feed_ID }.test/feed/`,
	has_icon: true,
	...overrides,
} );

const feedIdOrder = ( source: string ): number[] =>
	[ ...source.matchAll( /feed_ID: (\d+),/g ) ].map( ( m ) => Number( m[ 1 ] ) );

describe( 'serializeWithAdditions', () => {
	it( 'returns the existing file body unchanged when there are no additions', () => {
		const tagMap: CuratedBlogsList = {
			food: [ entry( { feed_ID: 1 } ), entry( { feed_ID: 2 } ) ],
			drinks: [ entry( { feed_ID: 3 } ) ],
		};

		const out = serializeWithAdditions( {
			variableName: 'fooBlogs',
			tagMap,
			additions: {},
		} );

		expect( feedIdOrder( out ) ).toEqual( [ 1, 2, 3 ] );
		expect( out ).toMatch( /^import \{ CuratedBlogsList \} from '\.\/index';\n/ );
		expect( out ).toContain( 'export const fooBlogs: CuratedBlogsList = {' );
	} );

	it( 'prepends additions to the matching tag with newest at top', () => {
		// Storage order is insertion order (oldest first); the serializer
		// reverses so the most recently added entry sits at the top of the
		// emitted tag block.
		const out = serializeWithAdditions( {
			variableName: 'fooBlogs',
			tagMap: {
				food: [ entry( { feed_ID: 1 } ), entry( { feed_ID: 2 } ) ],
			},
			additions: {
				food: [ entry( { feed_ID: 100 } ), entry( { feed_ID: 200 } ) ],
			},
		} );

		expect( feedIdOrder( out ) ).toEqual( [ 200, 100, 1, 2 ] );
	} );

	it( 'isolates additions per tag', () => {
		const out = serializeWithAdditions( {
			variableName: 'fooBlogs',
			tagMap: {
				food: [ entry( { feed_ID: 1 } ) ],
				drinks: [ entry( { feed_ID: 2 } ) ],
			},
			additions: {
				food: [ entry( { feed_ID: 100 } ) ],
			},
		} );

		// Order: food additions, food existing, drinks (no additions).
		expect( feedIdOrder( out ) ).toEqual( [ 100, 1, 2 ] );
	} );

	it( 'preserves the source-file tag order when prepending additions', () => {
		const out = serializeWithAdditions( {
			variableName: 'fooBlogs',
			tagMap: {
				health: [ entry( { feed_ID: 1 } ) ],
				food: [ entry( { feed_ID: 2 } ) ],
				sports: [ entry( { feed_ID: 3 } ) ],
			},
			additions: {
				food: [ entry( { feed_ID: 100 } ) ],
			},
		} );

		const tagOrder = [ ...out.matchAll( /^\t([a-z]+): \[/gm ) ].map( ( m ) => m[ 1 ] );
		expect( tagOrder ).toEqual( [ 'health', 'food', 'sports' ] );
	} );

	it( 'appends new tags that exist only in additions after the source-file tags', () => {
		const out = serializeWithAdditions( {
			variableName: 'fooBlogs',
			tagMap: {
				food: [ entry( { feed_ID: 1 } ) ],
			},
			additions: {
				health: [ entry( { feed_ID: 100 } ) ],
			},
		} );

		const tagOrder = [ ...out.matchAll( /^\t([a-z]+): \[/gm ) ].map( ( m ) => m[ 1 ] );
		expect( tagOrder ).toEqual( [ 'food', 'health' ] );
		expect( feedIdOrder( out ) ).toEqual( [ 1, 100 ] );
	} );

	it( 'emits hasIcon=false for added entries with has_icon overridden', () => {
		const out = serializeWithAdditions( {
			variableName: 'fooBlogs',
			tagMap: {},
			additions: {
				food: [ entry( { feed_ID: 100, has_icon: false } ) ],
			},
		} );

		expect( out ).toContain( 'feed_ID: 100,' );
		expect( out ).toContain( 'hasIcon: false,' );
	} );

	it( 'uses the addition entry feed_URL verbatim', () => {
		const out = serializeWithAdditions( {
			variableName: 'fooBlogs',
			tagMap: {},
			additions: {
				food: [
					entry( {
						feed_ID: 100,
						feed_URL: 'https://canonical.example.test/atom.xml',
					} ),
				],
			},
		} );

		expect( out ).toContain( "feedUrl: 'https://canonical.example.test/atom.xml'," );
	} );
} );
