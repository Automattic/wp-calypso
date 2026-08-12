import { findScopeFailures } from '../../../bin/verify-css-scope';
import { prefix as PREFIX } from '../../../webpack-css-scope';

// One prefixed rule, both entry points self-styled unprefixed, and a portal root legitimately
// nested inside the prefix — satisfies every check.
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

	it( 'flags .components-popover__fallback-container self-nesting — the @wordpress/components Popover fallback', () => {
		const css = `
			${ PREFIX } .card{color:red}
			.jp-stats-dashboard{--sidebar-width-max:160px}
			.jp-stats-widget{background:#fff}
			${ PREFIX } .components-popover__fallback-container{position:fixed}
		`;

		expect( findScopeFailures( css ) ).toEqual( [
			expect.stringContaining(
				'nests .components-popover__fallback-container under a `:where(...)` group'
			),
		] );
	} );

	it( 'does not flag a portal root (.color-scheme) nested inside an entry-point root — that is legitimate, not dead', () => {
		const css = `
			${ PREFIX } .color-scheme.is-light .masterbar{color:blue}
			.jp-stats-dashboard{--sidebar-width-max:160px}
			.jp-stats-widget{background:#fff}
		`;

		expect( findScopeFailures( css ) ).toEqual( [] );
	} );

	it( 'flags self-nesting for an entry-point root added to entryPointRoots in the future, with no changes to this test file', () => {
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

	it( 'fails loudly if a root exists in prefix but was never classified as an entry point or portal root', () => {
		const futurePrefix = ':where(.jp-stats-dashboard, .jp-stats-new-widget)';
		const css = `
			${ futurePrefix } .card{color:red}
			.jp-stats-dashboard{--sidebar-width-max:160px}
		`;

		// .jp-stats-new-widget is deliberately left unclassified (no third argument).
		expect( findScopeFailures( css, futurePrefix, [ '.jp-stats-dashboard' ] ) ).toEqual( [
			expect.stringContaining(
				'.jp-stats-new-widget is in `prefix` but not classified in `entryPointRoots` or `portalRoots`'
			),
		] );
	} );

	it( 'flags a prefixed `body>` selector — the compressed form that shipped dead', () => {
		// The real regression: stats-main/style.scss applies the Stats interactive colours at
		// `body > .color-scheme` to reach the body child Odyssey's RootChild portals into. Sass
		// emitted it without spaces, `exclude` only recognised the spaced form, and the rule was
		// prefixed into something that can never match.
		const css = `
			${ PREFIX } body>.color-scheme .date-range__picker{--color-accent:red}
			.jp-stats-dashboard{--sidebar-width-max:160px}
			.jp-stats-widget{background:#fff}
		`;

		expect( findScopeFailures( css ) ).toEqual( [
			expect.stringContaining( 'was prefixed despite being anchored on body' ),
		] );
	} );

	it.each( [ 'html.rtl .card', 'body.is-section-stats .card', ':root .card', '.foo body .card' ] )(
		'flags `%s` when prefixed, whatever the combinator or position',
		( selector ) => {
			const css = `
				${ PREFIX } ${ selector }{color:red}
				.jp-stats-dashboard{--sidebar-width-max:160px}
				.jp-stats-widget{background:#fff}
			`;

			expect( findScopeFailures( css ) ).toEqual( [
				expect.stringContaining( 'the prefix requires to be a descendant of a mount point' ),
			] );
		}
	);

	it( 'does not flag a document-root selector that was correctly left unprefixed', () => {
		const css = `
			body>.color-scheme .date-range__picker{--color-accent:red}
			${ PREFIX } .card{color:red}
			.jp-stats-dashboard{--sidebar-width-max:160px}
			.jp-stats-widget{background:#fff}
		`;

		expect( findScopeFailures( css ) ).toEqual( [] );
	} );

	it( 'does not flag a class merely containing a root tag name, such as .components-panel__body', () => {
		const css = `
			${ PREFIX } .components-panel__body .card{color:red}
			.jp-stats-dashboard{--sidebar-width-max:160px}
			.jp-stats-widget{background:#fff}
		`;

		expect( findScopeFailures( css ) ).toEqual( [] );
	} );

	it( 'is unaffected by minification stripping whitespace after commas in :where(...)', () => {
		const minifiedPrefix = PREFIX.replace( /,\s+/g, ',' );
		const css = `
			${ minifiedPrefix } .card{color:red}
			.jp-stats-dashboard{--sidebar-width-max:160px}
			.jp-stats-widget{background:#fff}
		`;

		expect( findScopeFailures( css ) ).toEqual( [] );
	} );
} );
