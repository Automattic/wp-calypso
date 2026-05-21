import { serializeCurated, type CuratedRowMetadata } from '../serialize-curated';
import type { CuratedBlog } from '../../curated-blogs';

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

const metadata = ( overrides?: Partial< CuratedRowMetadata > ): CuratedRowMetadata => ( {
	feedUrl: 'https://example.test/feed/',
	hasIcon: true,
	...overrides,
} );

describe( 'serializeCurated', () => {
	it( 'emits a runnable module body with the import + export header', () => {
		const out = serializeCurated( {
			variableName: 'fooBlogs',
			tagMap: { food: [ entry( { feed_ID: 1 } ) ] },
			getMetadata: () => metadata(),
		} );

		expect( out ).toMatch( /^import \{ CuratedBlogsList \} from '\.\/index';\n/ );
		expect( out ).toContain( 'export const fooBlogs: CuratedBlogsList = {' );
		expect( out ).toMatch( /};\n$/ );
	} );

	it( 'preserves tag insertion order and per-tag entry order', () => {
		const out = serializeCurated( {
			variableName: 'bar',
			tagMap: {
				health: [ entry( { feed_ID: 10 } ), entry( { feed_ID: 20 } ) ],
				food: [ entry( { feed_ID: 30 } ) ],
			},
			getMetadata: () => metadata(),
		} );

		const tagOrder = [ ...out.matchAll( /^\t([a-z]+):/gm ) ].map( ( m ) => m[ 1 ] );
		expect( tagOrder ).toEqual( [ 'health', 'food' ] );

		const idOrder = [ ...out.matchAll( /feed_ID: (\d+),/g ) ].map( ( m ) => Number( m[ 1 ] ) );
		expect( idOrder ).toEqual( [ 10, 20, 30 ] );
	} );

	it( 'always emits feed_URL and has_icon for every entry', () => {
		const out = serializeCurated( {
			variableName: 'bar',
			tagMap: { food: [ entry( { feed_ID: 1 } ), entry( { feed_ID: 2 } ) ] },
			getMetadata: () => metadata( { feedUrl: 'https://canonical/feed/', hasIcon: false } ),
		} );

		expect( out.match( /feed_URL: 'https:\/\/canonical\/feed\/',/g ) ).toHaveLength( 2 );
		expect( out.match( /has_icon: false,/g ) ).toHaveLength( 2 );
	} );

	it( 'omits entries when getMetadata returns null', () => {
		const out = serializeCurated( {
			variableName: 'bar',
			tagMap: {
				food: [ entry( { feed_ID: 1 } ), entry( { feed_ID: 2 } ), entry( { feed_ID: 3 } ) ],
			},
			getMetadata: ( e ) => ( e.feed_ID === 2 ? null : metadata() ),
		} );

		const ids = [ ...out.matchAll( /feed_ID: (\d+),/g ) ].map( ( m ) => Number( m[ 1 ] ) );
		expect( ids ).toEqual( [ 1, 3 ] );
	} );

	it( 'drops tags whose entries are all omitted', () => {
		const out = serializeCurated( {
			variableName: 'bar',
			tagMap: {
				food: [ entry( { feed_ID: 1 } ), entry( { feed_ID: 2 } ) ],
				health: [ entry( { feed_ID: 3 } ) ],
				sports: [ entry( { feed_ID: 4 } ), entry( { feed_ID: 5 } ) ],
			},
			// Mark every entry under "health" broken; "sports" partially.
			getMetadata: ( e ) => ( e.feed_ID === 3 || e.feed_ID === 4 ? null : metadata() ),
		} );

		expect( out ).toContain( '\tfood: [' );
		expect( out ).toContain( '\tsports: [' );
		expect( out ).not.toContain( 'health' );
	} );

	it( 'never emits an `isBroken` field', () => {
		const out = serializeCurated( {
			variableName: 'bar',
			tagMap: { food: [ entry( { feed_ID: 1 } ) ] },
			getMetadata: () => metadata(),
		} );

		expect( out ).not.toContain( 'isBroken' );
	} );

	it( 'escapes backslashes, newlines, tabs, and control chars safely', () => {
		const out = serializeCurated( {
			variableName: 'bar',
			tagMap: {
				food: [
					entry( {
						feed_ID: 1,
						site_name: 'a\\b\nc\td\u0001e',
						site_URL: 'https://example.test/path/with\\backslash/',
					} ),
				],
			},
			getMetadata: () => metadata( { feedUrl: 'https://example.test/feed/\nfoo' } ),
		} );

		// JSON.stringify-based escaping should produce a runnable TS literal —
		// no embedded raw newline / tab in the source, and backslashes doubled.
		expect( out ).toContain( "site_name: 'a\\\\b\\nc\\td\\u0001e'" );
		expect( out ).toContain( "site_URL: 'https://example.test/path/with\\\\backslash/'" );
		expect( out ).toContain( "feed_URL: 'https://example.test/feed/\\nfoo'" );

		// Sanity check: round-trip via JSON.parse on the emitted single-quoted
		// strings. We can't run TS here, but we can verify that the escape
		// content matches what the source author intended by re-parsing each
		// emitted literal as JSON (after swapping wrapping quotes).
		const matches = [ ...out.matchAll( /(?:site_name|site_URL|feed_URL): '([^']*)',/g ) ];
		expect( matches.length ).toBeGreaterThan( 0 );
		for ( const [ , inner ] of matches ) {
			expect( () => JSON.parse( `"${ inner }"` ) ).not.toThrow();
		}
	} );

	it( 'uses double quotes for strings containing apostrophes', () => {
		const out = serializeCurated( {
			variableName: 'bar',
			tagMap: {
				food: [
					entry( {
						feed_ID: 1,
						site_name: "Dr. Hunter's Wellness",
					} ),
				],
			},
			getMetadata: () => metadata(),
		} );

		expect( out ).toContain( 'site_name: "Dr. Hunter\'s Wellness",' );
	} );

	it( 'quotes hyphenated tag keys', () => {
		const out = serializeCurated( {
			variableName: 'bar',
			tagMap: { 'k-12': [ entry( { feed_ID: 1 } ) ] },
			getMetadata: () => metadata(),
		} );

		expect( out ).toContain( "\t'k-12': [" );
	} );

	it( 'leaves bare identifier tags unquoted', () => {
		const out = serializeCurated( {
			variableName: 'bar',
			tagMap: { health: [ entry( { feed_ID: 1 } ) ] },
			getMetadata: () => metadata(),
		} );

		expect( out ).toContain( '\thealth: [' );
		expect( out ).not.toContain( "'health':" );
	} );

	it( 'produces structurally balanced source for partial-omission cases', () => {
		const out = serializeCurated( {
			variableName: 'fooBlogs',
			tagMap: {
				food: [
					entry( { feed_ID: 1, site_name: "Bob's Diner" } ),
					entry( { feed_ID: 2 } ),
					entry( { feed_ID: 3 } ),
				],
			},
			getMetadata: ( e ) =>
				e.feed_ID === 2
					? null
					: metadata( {
							feedUrl: `https://example-${ e.feed_ID }.test/feed/`,
							hasIcon: e.feed_ID === 1,
					  } ),
		} );

		// Braces / brackets balance.
		expect( ( out.match( /\{/g ) || [] ).length ).toBe( ( out.match( /\}/g ) || [] ).length );
		expect( ( out.match( /\[/g ) || [] ).length ).toBe( ( out.match( /\]/g ) || [] ).length );
		// Two surviving entries — feed_ID 2 was omitted.
		const entryClosers = out.match( /^\t\t\},$/gm );
		expect( entryClosers ).toHaveLength( 2 );
	} );

	it( 'produces an empty body when every entry is omitted', () => {
		const out = serializeCurated( {
			variableName: 'fooBlogs',
			tagMap: {
				food: [ entry( { feed_ID: 1 } ), entry( { feed_ID: 2 } ) ],
				health: [ entry( { feed_ID: 3 } ) ],
			},
			getMetadata: () => null,
		} );

		expect( out ).toBe(
			[
				"import { CuratedBlogsList } from './index';",
				'',
				'export const fooBlogs: CuratedBlogsList = {',
				'};',
				'',
			].join( '\n' )
		);
	} );
} );
