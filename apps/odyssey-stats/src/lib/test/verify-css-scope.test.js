import { findScopeFailures } from '../../../bin/verify-css-scope';

const PREFIX =
	':where(.jp-stats-dashboard, .color-scheme, .ReactModalPortal, [data-base-ui-portal], [data-wp-compat-overlay-slot], .components-modal__screen-overlay, .jp-stats-widget)';

/**
 * A minimal compiled bundle that satisfies every check: one prefixed rule (proving the scoping
 * step ran) and one non-empty, unprefixed rule for each self-scoping mount point.
 */
const HEALTHY_CSS = `
${ PREFIX } .card{color:red}
.jp-stats-widget{background:#fff}
.color-scheme.is-midnight{--color-accent:red}
.stats-widget-content.color-scheme{--color-primary:red}
`;

describe( 'verify-css-scope findScopeFailures', () => {
	it( 'reports no failures for a healthy compiled bundle', () => {
		expect( findScopeFailures( HEALTHY_CSS ) ).toEqual( [] );
	} );

	it( 'flags a build where nothing was ever prefixed', () => {
		const css = `
			.jp-stats-widget{background:#fff}
			.color-scheme.is-midnight{--color-accent:red}
			.stats-widget-content.color-scheme{--color-primary:red}
		`;

		const failures = findScopeFailures( css );

		expect( failures ).toEqual( [ expect.stringContaining( 'scoping step may not be running' ) ] );
	} );

	it( 'flags a mount point whose own root rule went dead — the STATS-368 regression', () => {
		// Same as HEALTHY_CSS, but .jp-stats-widget's own root rule is missing its exclude entry
		// and got nested under the prefix, exactly like removing it from webpack-css-scope.js's
		// `exclude` list would produce.
		const css = `
			${ PREFIX } .card{color:red}
			${ PREFIX } .jp-stats-widget{background:#fff}
			.color-scheme.is-midnight{--color-accent:red}
			.stats-widget-content.color-scheme{--color-primary:red}
		`;

		const failures = findScopeFailures( css );

		expect( failures ).toEqual( [ expect.stringContaining( '.jp-stats-widget' ) ] );
	} );

	it( 'flags a self-scoping rule that compiled but ended up empty', () => {
		const css = `
			${ PREFIX } .card{color:red}
			.jp-stats-widget{}
			.color-scheme.is-midnight{--color-accent:red}
			.stats-widget-content.color-scheme{--color-primary:red}
		`;

		const failures = findScopeFailures( css );

		expect( failures ).toEqual( [ expect.stringContaining( '.jp-stats-widget' ) ] );
	} );

	it( 'is unaffected by minification stripping whitespace after commas in :where(...)', () => {
		const minifiedPrefix =
			':where(.jp-stats-dashboard,.color-scheme,.ReactModalPortal,[data-base-ui-portal],[data-wp-compat-overlay-slot],.components-modal__screen-overlay,.jp-stats-widget)';
		const css = `
			${ minifiedPrefix } .card{color:red}
			.jp-stats-widget{background:#fff}
			.color-scheme.is-midnight{--color-accent:red}
			.stats-widget-content.color-scheme{--color-primary:red}
		`;

		expect( findScopeFailures( css ) ).toEqual( [] );
	} );
} );
