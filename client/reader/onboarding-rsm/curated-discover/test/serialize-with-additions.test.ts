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

		const { source, skipped } = serializeWithAdditions( {
			variableName: 'fooBlogs',
			tagMap,
			additions: {},
		} );

		expect( feedIdOrder( source ) ).toEqual( [ 1, 2, 3 ] );
		expect( source ).toMatch( /^import \{ CuratedBlogsList \} from '\.\/index';\n/ );
		expect( source ).toContain( 'export const fooBlogs: CuratedBlogsList = {' );
		expect( skipped ).toBe( 0 );
	} );

	it( 'prepends additions to the matching tag with newest at top', () => {
		// Storage order is insertion order (oldest first); the serializer
		// reverses so the most recently added entry sits at the top of the
		// emitted tag block.
		const { source } = serializeWithAdditions( {
			variableName: 'fooBlogs',
			tagMap: {
				food: [ entry( { feed_ID: 1 } ), entry( { feed_ID: 2 } ) ],
			},
			additions: {
				food: [ entry( { feed_ID: 100 } ), entry( { feed_ID: 200 } ) ],
			},
		} );

		expect( feedIdOrder( source ) ).toEqual( [ 200, 100, 1, 2 ] );
	} );

	it( 'isolates additions per tag', () => {
		const { source } = serializeWithAdditions( {
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
		expect( feedIdOrder( source ) ).toEqual( [ 100, 1, 2 ] );
	} );

	it( 'preserves the source-file tag order when prepending additions', () => {
		const { source } = serializeWithAdditions( {
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

		const tagOrder = [ ...source.matchAll( /^\t([a-z]+): \[/gm ) ].map( ( m ) => m[ 1 ] );
		expect( tagOrder ).toEqual( [ 'health', 'food', 'sports' ] );
	} );

	it( 'appends new tags that exist only in additions after the source-file tags', () => {
		const { source } = serializeWithAdditions( {
			variableName: 'fooBlogs',
			tagMap: {
				food: [ entry( { feed_ID: 1 } ) ],
			},
			additions: {
				health: [ entry( { feed_ID: 100 } ) ],
			},
		} );

		const tagOrder = [ ...source.matchAll( /^\t([a-z]+): \[/gm ) ].map( ( m ) => m[ 1 ] );
		expect( tagOrder ).toEqual( [ 'food', 'health' ] );
		expect( feedIdOrder( source ) ).toEqual( [ 1, 100 ] );
	} );

	it( 'emits has_icon=false for added entries with has_icon overridden', () => {
		const { source } = serializeWithAdditions( {
			variableName: 'fooBlogs',
			tagMap: {},
			additions: {
				food: [ entry( { feed_ID: 100, has_icon: false } ) ],
			},
		} );

		expect( source ).toContain( 'feed_ID: 100,' );
		expect( source ).toContain( 'has_icon: false,' );
	} );

	it( 'uses the addition entry feed_URL verbatim', () => {
		const { source } = serializeWithAdditions( {
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

		expect( source ).toContain( "feed_URL: 'https://canonical.example.test/atom.xml'," );
	} );

	describe( 'skip-and-warn for incomplete entries', () => {
		// Silence the diagnostic warns the serializer emits for skipped rows so
		// the test output stays readable. The warns themselves are validated
		// where it matters.
		let warnSpy: jest.SpyInstance;
		beforeEach( () => {
			warnSpy = jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );
		} );
		afterEach( () => {
			warnSpy.mockRestore();
		} );

		it( 'drops entries whose feed_URL is missing instead of crashing', () => {
			const incomplete = {
				feed_ID: 999,
				site_ID: 1234,
				site_URL: 'https://example-999.test/',
				site_name: 'Example 999',
				// `feed_URL` is intentionally undefined to mimic a stale
				// localStorage row from before the buildEntryForAdd validation
				// tightened.
			} as unknown as CuratedBlog;

			const { source, skipped } = serializeWithAdditions( {
				variableName: 'fooBlogs',
				tagMap: {
					food: [ entry( { feed_ID: 1 } ) ],
				},
				additions: {
					food: [ incomplete ],
				},
			} );

			expect( skipped ).toBe( 1 );
			expect( feedIdOrder( source ) ).toEqual( [ 1 ] );
			expect( warnSpy ).toHaveBeenCalledWith(
				expect.stringContaining( 'feed_ID=999' ),
				incomplete
			);
		} );

		it( 'drops entries whose site_URL is missing', () => {
			const incomplete = {
				feed_ID: 999,
				site_ID: 1234,
				site_name: 'Example 999',
				feed_URL: 'https://example-999.test/feed/',
				has_icon: true,
			} as unknown as CuratedBlog;

			const { source, skipped } = serializeWithAdditions( {
				variableName: 'fooBlogs',
				tagMap: { food: [ entry( { feed_ID: 1 } ) ] },
				additions: { food: [ incomplete ] },
			} );

			expect( skipped ).toBe( 1 );
			expect( feedIdOrder( source ) ).toEqual( [ 1 ] );
		} );

		it( 'drops a tag entirely when every entry under it is incomplete', () => {
			const incomplete = { feed_ID: 999, site_ID: 1234 } as unknown as CuratedBlog;

			const { source, skipped } = serializeWithAdditions( {
				variableName: 'fooBlogs',
				tagMap: {},
				additions: { orphan: [ incomplete ] },
			} );

			expect( skipped ).toBe( 1 );
			// Empty tag block must not appear in the output.
			expect( source ).not.toContain( 'orphan:' );
		} );

		it( 'reports skipped == 0 when all entries are complete', () => {
			const { skipped } = serializeWithAdditions( {
				variableName: 'fooBlogs',
				tagMap: { food: [ entry( { feed_ID: 1 } ) ] },
				additions: { food: [ entry( { feed_ID: 100 } ) ] },
			} );

			expect( skipped ).toBe( 0 );
			expect( warnSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'dedup against existing source', () => {
		// Same warn-silencing pattern as the skip-and-warn block — the dedup path
		// also `console.warn`s every dropped entry, and we validate at least one
		// of those calls landed.
		let warnSpy: jest.SpyInstance;
		beforeEach( () => {
			warnSpy = jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );
		} );
		afterEach( () => {
			warnSpy.mockRestore();
		} );

		it( 'drops additions whose feed_ID already exists in the same tag', () => {
			// Mirrors the post-paste-still-has-additions case: tag already
			// includes `feed_ID: 1` from a prior export, and the additions
			// store still carries it. The export must not duplicate.
			const { source, deduped } = serializeWithAdditions( {
				variableName: 'fooBlogs',
				tagMap: {
					food: [ entry( { feed_ID: 1 } ), entry( { feed_ID: 2 } ) ],
				},
				additions: {
					food: [ entry( { feed_ID: 1 } ), entry( { feed_ID: 100 } ) ],
				},
			} );

			expect( feedIdOrder( source ) ).toEqual( [ 100, 1, 2 ] );
			expect( deduped ).toBe( 1 );
			expect( warnSpy ).toHaveBeenCalledWith(
				expect.stringContaining( 'already in source' ),
				expect.objectContaining( { feed_ID: 1 } )
			);
		} );

		it( 'allows the same feed_ID across different tags (no cross-tag dedup)', () => {
			// Cross-tag duplication is intentional in the curated source
			// schema — `popular.tsx` famously shares feeds with the topical
			// files. The dedup must only kick in for the same tag.
			const { source, deduped } = serializeWithAdditions( {
				variableName: 'fooBlogs',
				tagMap: {
					food: [ entry( { feed_ID: 1 } ) ],
					drinks: [],
				},
				additions: {
					drinks: [ entry( { feed_ID: 1 } ) ],
				},
			} );

			expect( deduped ).toBe( 0 );
			// `food` keeps its original entry; `drinks` gets the addition.
			expect( feedIdOrder( source ) ).toEqual( [ 1, 1 ] );
		} );

		it( 'drops intra-additions duplicates (defense in depth)', () => {
			// `useAddedCandidates.add` already no-ops on same-tag dupes, but
			// a hand-edited / corrupted localStorage entry could carry the
			// same feed twice. The serializer must collapse those too.
			const a = entry( { feed_ID: 100 } );
			const aDup = entry( { feed_ID: 100 } );
			const { source, deduped } = serializeWithAdditions( {
				variableName: 'fooBlogs',
				tagMap: {},
				additions: {
					food: [ a, aDup, entry( { feed_ID: 200 } ) ],
				},
			} );

			expect( feedIdOrder( source ) ).toEqual( [ 200, 100 ] );
			expect( deduped ).toBe( 1 );
			expect( warnSpy ).toHaveBeenCalledWith(
				expect.stringContaining( 'duplicate within additions' ),
				expect.objectContaining( { feed_ID: 100 } )
			);
		} );

		it( 'is idempotent across the copy → paste → re-add → copy compounding flow', () => {
			// Reproduces the operator-reported bug: A and B are added,
			// exported, pasted into the source file. The operator then
			// adds C and D without clearing localStorage, so additions
			// still contains [A, B, C, D]. The next export must not
			// duplicate A and B.
			const A = entry( { feed_ID: 10 } );
			const B = entry( { feed_ID: 20 } );
			const C = entry( { feed_ID: 30 } );
			const D = entry( { feed_ID: 40 } );
			const original = entry( { feed_ID: 1 } );

			const round1 = serializeWithAdditions( {
				variableName: 'fooBlogs',
				tagMap: { music: [ original ] },
				additions: { music: [ A, B ] },
			} );
			expect( feedIdOrder( round1.source ) ).toEqual( [ 20, 10, 1 ] );
			expect( round1.deduped ).toBe( 0 );

			// Operator pastes round1 source into music: [B, A, original].
			// localStorage still has [A, B], and the operator appends C, D.
			const round2 = serializeWithAdditions( {
				variableName: 'fooBlogs',
				tagMap: { music: [ B, A, original ] },
				additions: { music: [ A, B, C, D ] },
			} );
			expect( feedIdOrder( round2.source ) ).toEqual( [ 40, 30, 20, 10, 1 ] );
			expect( round2.deduped ).toBe( 2 );

			// Same again: paste round2, append E and F, prior additions still
			// resident in localStorage. No new duplication.
			const E = entry( { feed_ID: 50 } );
			const F = entry( { feed_ID: 60 } );
			const round3 = serializeWithAdditions( {
				variableName: 'fooBlogs',
				tagMap: { music: [ D, C, B, A, original ] },
				additions: { music: [ A, B, C, D, E, F ] },
			} );
			expect( feedIdOrder( round3.source ) ).toEqual( [ 60, 50, 40, 30, 20, 10, 1 ] );
			expect( round3.deduped ).toBe( 4 );
		} );

		it( 'reports deduped == 0 when nothing overlaps', () => {
			const { deduped } = serializeWithAdditions( {
				variableName: 'fooBlogs',
				tagMap: { food: [ entry( { feed_ID: 1 } ) ] },
				additions: { food: [ entry( { feed_ID: 100 } ) ] },
			} );

			expect( deduped ).toBe( 0 );
			expect( warnSpy ).not.toHaveBeenCalled();
		} );
	} );
} );
