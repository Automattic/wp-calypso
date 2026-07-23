import postcss from 'postcss';
import prefixSelectorPlugin from 'postcss-prefix-selector';
import cssScope from '../../../webpack-css-scope';

/**
 * Runs representative CSS through the real webpack `postcss-prefix-selector` config (the same
 * options object webpack.config.js hands the plugin) and returns the compiled CSS text, so tests
 * assert on what actually ships rather than a hand-copied stand-in.
 */
function compile( css, { from } = {} ) {
	return postcss( [ prefixSelectorPlugin( cssScope ) ] ).process( css, { from } ).css;
}

/**
 * Builds a DOM fixture with a `.jp-stats-dashboard` mount, a `.jp-stats-widget` mount, and
 * unrelated wp-admin chrome outside both, injects the compiled CSS, and returns the elements
 * tests match selectors against.
 */
function buildFixture( compiledCss ) {
	document.body.innerHTML = `
		<div class="jp-stats-dashboard"><div class="card" id="dashboard-card"></div></div>
		<div class="jp-stats-widget"><div class="card" id="widget-card"></div></div>
		<div id="adminmenu"><div class="card" id="adminmenu-card"></div></div>
	`;
	const style = document.createElement( 'style' );
	style.textContent = compiledCss;
	document.head.appendChild( style );
	return {
		dashboardCard: document.getElementById( 'dashboard-card' ),
		widgetCard: document.getElementById( 'widget-card' ),
		adminmenuCard: document.getElementById( 'adminmenu-card' ),
		widgetRoot: document.querySelector( '.jp-stats-widget' ),
	};
}

describe( 'Odyssey Stats CSS scoping (webpack-css-scope.js)', () => {
	it( 'scopes a shared component selector under both .jp-stats-dashboard and .jp-stats-widget, but not outside either', () => {
		// A distinctive, non-default color, so a passing assertion actually proves the rule
		// applied — unlike e.g. `border-width`, whose computed value collapses to 0 regardless of
		// the declared width whenever `border-style` is left at its `none` default, which would
		// make an unscoped/never-applied rule indistinguishable from a correctly scoped one.
		const compiled = compile( '.card { color: rgb(1, 2, 3); }', {
			from: 'odyssey-stats/src/widget/index.scss',
		} );
		const { dashboardCard, widgetCard, adminmenuCard } = buildFixture( compiled );

		expect( dashboardCard.matches( ':where(.jp-stats-dashboard, .jp-stats-widget) .card' ) ).toBe(
			true
		);
		expect( getComputedStyle( dashboardCard ).color ).toBe( 'rgb(1, 2, 3)' );
		expect( getComputedStyle( widgetCard ).color ).toBe( 'rgb(1, 2, 3)' );
		expect( getComputedStyle( adminmenuCard ).color ).not.toBe( 'rgb(1, 2, 3)' );
	} );

	it( 'leaves .jp-stats-widget matching the widget mount itself, not a descendant of it', () => {
		const compiled = compile(
			'.jp-stats-widget { color: green; }\n.jp-stats-widget.is-ready { color: red; }',
			{ from: 'odyssey-stats/src/widget/index.scss' }
		);
		const { widgetRoot } = buildFixture( compiled );

		// If these rules got nested under the prefix (`:where(...) .jp-stats-widget {...}`),
		// they'd require an ancestor of `.jp-stats-widget` matching the prefix — which doesn't
		// exist, since `.jp-stats-widget` IS one of the prefix roots. That's the exact bug this
		// exclusion prevents: verify it by asserting the styles actually apply to the root itself.
		expect( getComputedStyle( widgetRoot ).color ).toBe( 'green' );

		widgetRoot.classList.add( 'is-ready' );
		expect( getComputedStyle( widgetRoot ).color ).toBe( 'red' );
	} );

	it( 'does not prefix an unrelated selector that merely starts with the widget class name', () => {
		const compiled = compile( '.jp-stats-widget-extra { color: blue; }' );

		expect( compiled ).toContain( ':where(' );
		expect( compiled ).not.toMatch( /^\.jp-stats-widget-extra/m );
	} );

	it( 'leaves app.scss (already hand-scoped to .jp-stats-dashboard) unprefixed', () => {
		const compiled = compile( '.jp-stats-dashboard .card { border: 0; }', {
			from: 'odyssey-stats/src/app.scss',
		} );

		expect( compiled.trim() ).toBe( '.jp-stats-dashboard .card { border: 0; }' );
	} );
} );
