import { findScopeFailures } from '../../../bin/verify-css-scope';

const PREFIX =
	':where(.jp-stats-dashboard, .color-scheme, .ReactModalPortal, [data-base-ui-portal], [data-wp-compat-overlay-slot], .components-modal__screen-overlay, .jp-stats-widget)';

/**
 * A minimal compiled bundle that satisfies every check: one prefixed rule (proving the scoping
 * step ran), and both entry-point mount points' own root styling left correctly unprefixed. Also
 * includes `.color-scheme` legitimately nested *inside* the prefix (per-section theming) — that's
 * normal, not dead, since .color-scheme is a portal root, not an entry point.
 */
const HEALTHY_CSS = `
${ PREFIX } .card{color:red}
${ PREFIX } .color-scheme.is-light .masterbar{color:blue}
.jp-stats-dashboard{--sidebar-width-max:160px}
.jp-stats-widget{background:#fff}
`;

describe( 'verify-css-scope findScopeFailures', () => {
	it( 'reports no failures for a healthy compiled bundle', () => {
		expect( findScopeFailures( HEALTHY_CSS ) ).toEqual( [] );
	} );

	it( 'flags a build where nothing was ever prefixed', () => {
		const css = `
			.jp-stats-dashboard{--sidebar-width-max:160px}
			.jp-stats-widget{background:#fff}
		`;

		expect( findScopeFailures( css ) ).toEqual( [
			expect.stringContaining( 'scoping step may not be running' ),
		] );
	} );

	it( 'flags .jp-stats-widget self-nesting — the original STATS-368 regression', () => {
		// Same as HEALTHY_CSS, but .jp-stats-widget's own root rule is missing its exclude entry
		// and got nested under the prefix, exactly like removing it from webpack-css-scope.js's
		// `exclude` list would produce.
		const css = `
			${ PREFIX } .card{color:red}
			.jp-stats-dashboard{--sidebar-width-max:160px}
			${ PREFIX } .jp-stats-widget{background:#fff}
		`;

		expect( findScopeFailures( css ) ).toEqual( [
			expect.stringContaining( 'nests .jp-stats-widget under a `:where(...)` group' ),
		] );
	} );

	it( 'flags .jp-stats-dashboard self-nesting at any depth in the chain, not just bare', () => {
		// wp-admin.scss nests several rules under `.jp-stats-dashboard { & .layout__content { ... } }`.
		// Without .jp-stats-dashboard's own exclude entry, the *whole* block goes dead the same way,
		// not just a bare `.jp-stats-dashboard { ... }` rule — the check needs to catch both shapes.
		const css = `
			${ PREFIX } .card{color:red}
			${ PREFIX } .jp-stats-dashboard{--sidebar-width-max:160px}
			${ PREFIX } .jp-stats-dashboard .layout__content{padding-top:0}
			.jp-stats-widget{background:#fff}
		`;

		const failures = findScopeFailures( css );

		expect( failures ).toHaveLength( 2 );
		failures.forEach( ( failure ) =>
			expect( failure ).toEqual( expect.stringContaining( 'nests .jp-stats-dashboard' ) )
		);
	} );

	it( 'does not flag a portal root (.color-scheme) nested inside an entry-point root — that is legitimate, not dead', () => {
		// .color-scheme.is-light .masterbar is routinely nested *inside* .jp-stats-dashboard for
		// per-section theming (see css-scope.test.js), so it has a real, different ancestor
		// satisfying the prefix. Only entryPointRoots (never nested inside anything) are checked.
		const css = `
			${ PREFIX } .color-scheme.is-light .masterbar{color:blue}
			.jp-stats-dashboard{--sidebar-width-max:160px}
			.jp-stats-widget{background:#fff}
		`;

		expect( findScopeFailures( css ) ).toEqual( [] );
	} );

	it( 'flags self-nesting for an entry-point root added to entryPointRoots in the future, with no changes to this test file', () => {
		// Proves the check isn't tied to a hard-coded list of "known" mount points: it follows
		// whatever `entryPointRoots` is configured to (alongside `prefix`), so a brand new
		// standalone entry point that loses its own exclude entry gets caught the same way,
		// without anyone remembering to teach this specific check about it first.
		const futurePrefix = ':where(.jp-stats-dashboard, .jp-stats-new-widget)';
		const futureEntryPointRoots = [ '.jp-stats-dashboard', '.jp-stats-new-widget' ];
		const css = `
			${ futurePrefix } .card{color:red}
			${ futurePrefix } .jp-stats-new-widget{background:#fff}
		`;

		expect( findScopeFailures( css, futurePrefix, futureEntryPointRoots ) ).toEqual( [
			expect.stringContaining( 'nests .jp-stats-new-widget under a `:where(...)` group' ),
		] );
	} );

	it( 'is unaffected by minification stripping whitespace after commas in :where(...)', () => {
		const minifiedPrefix =
			':where(.jp-stats-dashboard,.color-scheme,.ReactModalPortal,[data-base-ui-portal],[data-wp-compat-overlay-slot],.components-modal__screen-overlay,.jp-stats-widget)';
		const css = `
			${ minifiedPrefix } .card{color:red}
			.jp-stats-dashboard{--sidebar-width-max:160px}
			.jp-stats-widget{background:#fff}
		`;

		expect( findScopeFailures( css ) ).toEqual( [] );
	} );
} );
