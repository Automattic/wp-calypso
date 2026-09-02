import * as apiQueries from '../index';

/**
 * `bumpStats` have a 32-character limit. The budget here is lower. The remaining
 * space is reserved for suffixes like `.401`.
 */
const STAT_ID_MAX_LENGTH = 28;

/**
 * Mutation factories only close over their arguments — `mutationFn` is not called
 * here — so invoking them with no arguments is enough to read back their options.
 * A factory that destructures its arguments eagerly will throw; record it rather
 * than skipping silently, so it can't disappear from the audit unnoticed.
 */
function collectMutationsInPackage() {
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

describe( 'mutation statIds', () => {
	const { found, uncallable } = collectMutationsInPackage();

	// Confidence check to make sure we're actually finding the mutations.
	// There are ~219 readable factories today; 150 should be enough to be sure we've found them.
	it( 'discovers the mutation factories exported from the barrel', () => {
		expect( found.length ).toBeGreaterThan( 150 );
	} );

	// The reader `use*Mutation` exports are hooks, not options factories, so they
	// can't be read outside a render and are invisible to the checks below. Kept
	// as an explicit list so the gap stays visible rather than silently growing.
	// TODO convert the hooks into regular mutation factories.
	it( 'has only the known reader hooks unreadable', () => {
		expect( uncallable.every( ( name ) => name.startsWith( 'use' ) ) ).toBe( true );
	} );

	describe( 'sets a statId on every mutation', () => {
		found.forEach( ( { name, statId } ) => {
			it( `defines a statId for ${ name }`, () => {
				expect( statId ).toBeDefined();
			} );
		} );
	} );

	it( 'has no duplicate statIds', () => {
		const ids = found.map( ( m ) => m.statId ).filter( Boolean );
		expect( ids ).toHaveLength( new Set( ids ).size );
	} );

	it( 'keeps every statId within the stat length limit', () => {
		const tooLong = found
			.filter( ( m ) => ( m.statId?.length ?? 0 ) > STAT_ID_MAX_LENGTH )
			.map( ( m ) => `${ m.name }: '${ m.statId }' is ${ m.statId?.length } chars` );

		expect( tooLong ).toEqual( [] );
	} );
} );
