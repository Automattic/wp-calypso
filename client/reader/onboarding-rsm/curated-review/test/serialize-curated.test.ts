import { serializeCurated, type CuratedRowMetadata } from '../serialize-curated';
import type { CuratedBlog } from '../../curated-blogs';

const entry = (
	overrides: Partial< CuratedBlog > & Pick< CuratedBlog, 'feed_ID' >
): CuratedBlog => ( {
	site_ID: 1000 + overrides.feed_ID,
	site_URL: `https://example-${ overrides.feed_ID }.test/`,
	site_name: `Example ${ overrides.feed_ID }`,
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

	it( 'always emits feedUrl and hasIcon for every entry', () => {
		const out = serializeCurated( {
			variableName: 'bar',
			tagMap: { food: [ entry( { feed_ID: 1 } ), entry( { feed_ID: 2 } ) ] },
			getMetadata: () => metadata( { feedUrl: 'https://canonical/feed/', hasIcon: false } ),
		} );

		expect( out.match( /feedUrl: 'https:\/\/canonical\/feed\/',/g ) ).toHaveLength( 2 );
		expect( out.match( /hasIcon: false,/g ) ).toHaveLength( 2 );
	} );

	it( 'omits isBroken when not true', () => {
		const out = serializeCurated( {
			variableName: 'bar',
			tagMap: { food: [ entry( { feed_ID: 1 } ) ] },
			getMetadata: () => metadata(),
		} );

		expect( out ).not.toContain( 'isBroken' );
	} );

	it( 'emits isBroken: true when set', () => {
		const out = serializeCurated( {
			variableName: 'bar',
			tagMap: {
				food: [ entry( { feed_ID: 1 } ), entry( { feed_ID: 2 } ) ],
			},
			getMetadata: ( e ) => metadata( e.feed_ID === 1 ? { isBroken: true } : undefined ),
		} );

		expect( out.match( /isBroken: true,/g ) ).toHaveLength( 1 );
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

	it( 'produces source that round-trips through eval-style parsing', () => {
		// Sanity check: the emitted body is valid TypeScript syntax. We can't
		// run a TS parser here cheaply, but we can verify a few structural
		// invariants that prettier/eslint would otherwise catch.
		const out = serializeCurated( {
			variableName: 'fooBlogs',
			tagMap: {
				food: [ entry( { feed_ID: 1, site_name: "Bob's Diner" } ), entry( { feed_ID: 2 } ) ],
			},
			getMetadata: ( e ) =>
				metadata( {
					feedUrl: `https://example-${ e.feed_ID }.test/feed/`,
					hasIcon: e.feed_ID === 1,
					isBroken: e.feed_ID === 2 ? true : undefined,
				} ),
		} );

		// One opening + closing brace per outer object, matching trailing commas.
		expect( ( out.match( /\{/g ) || [] ).length ).toBe( ( out.match( /\}/g ) || [] ).length );
		// One opening + closing bracket per tag array.
		expect( ( out.match( /\[/g ) || [] ).length ).toBe( ( out.match( /\]/g ) || [] ).length );
		// Trailing comma after every entry's closing brace.
		const entryClosers = out.match( /^\t\t\},$/gm );
		expect( entryClosers ).toHaveLength( 2 );
	} );
} );
