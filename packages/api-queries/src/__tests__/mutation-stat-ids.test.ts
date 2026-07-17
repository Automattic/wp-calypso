import * as apiQueries from '../index';

/**
 * `bumpMultipleStats()` enforces the 32-character limit `bumpStat` imposes. The budget here is
 * lower: the remaining characters are reserved for the `.<status>` suffix `MutationErrorTracker`
 * appends to the ID at bump time.
 */
const STAT_ID_MAX_LENGTH = 28;

/**
 * Mutation factories only close over their arguments — `mutationFn` is not called
 * here — so invoking them with no arguments is enough to read back their options.
 * A factory that destructures its arguments eagerly will throw; record it rather
 * than skipping silently, so it can't disappear from the audit unnoticed.
 */
function collectMutations() {
	const found: Array< { name: string; statId?: string } > = [];
	const uncallable: string[] = [];

	for ( const [ name, value ] of Object.entries( apiQueries ) ) {
		if ( ! name.endsWith( 'Mutation' ) || typeof value !== 'function' ) {
			continue;
		}

		try {
			const options = ( value as ( ...args: unknown[] ) => unknown )();
			if ( ! options || typeof options !== 'object' || ! ( 'mutationFn' in options ) ) {
				continue;
			}
			const meta = ( options as { meta?: { statId?: unknown } } ).meta;
			found.push( {
				name,
				statId: typeof meta?.statId === 'string' ? meta.statId : undefined,
			} );
		} catch {
			uncallable.push( name );
		}
	}

	return { found, uncallable };
}

describe( 'mutation statId', () => {
	const { found, uncallable } = collectMutations();

	// Without this the suite below would pass vacuously if the barrel stopped
	// exporting, every factory threw, or the naming convention changed. There are
	// ~219 readable factories today; the floor is loose enough not to need bumping.
	it( 'discovers the mutation factories exported from the barrel', () => {
		expect( found.length ).toBeGreaterThan( 150 );
	} );

	// The reader `use*Mutation` exports are hooks, not options factories, so they
	// can't be read outside a render and are invisible to the checks below. Kept
	// as an explicit list so the gap stays visible rather than silently growing.
	it( 'has only the known reader hooks unreadable', () => {
		expect( uncallable.every( ( name ) => name.startsWith( 'use' ) ) ).toBe( true );
	} );

	// `meta` carries an index signature (required by TS#15300), so a typo like
	// `statid` type-checks and leaves `statId` undefined. These two tests are the
	// only thing standing between that and a stat reported as 'missing'.
	it( 'sets a statId on every mutation', () => {
		const missing = found.filter( ( m ) => m.statId === undefined ).map( ( m ) => m.name );

		expect( missing ).toEqual( [] );
	} );

	// IDs are hand-written rather than derived from the export name, so nothing but this
	// stops two mutations reporting under one stat and silently pooling their failures.
	it( 'has no duplicate statIds', () => {
		const ids = found.map( ( m ) => m.statId ).filter( Boolean );
		expect( ids ).toHaveLength( new Set( ids ).size );
	} );

	// `bumpMultipleStats()` doesn't truncate an over-long ID, it reports it to Sentry — so one
	// of these costs a spurious exception on every failure of that mutation, forever. Fix by
	// shortening the ID: drop a redundant word, or abbreviate a phrase the way its family does.
	it( 'keeps every statId within the stat length limit', () => {
		const tooLong = found
			.filter( ( m ) => ( m.statId?.length ?? 0 ) > STAT_ID_MAX_LENGTH )
			.map( ( m ) => `${ m.name }: '${ m.statId }' is ${ m.statId?.length } chars` );

		expect( tooLong ).toEqual( [] );
	} );
} );
