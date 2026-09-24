import postcss from 'postcss';
import prefixSelectorPlugin from 'postcss-prefix-selector';
import { findScopeFailures } from '../../../bin/verify-css-scope';
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
	// Each case injects compiled CSS into document.head and leaves markup in document.body. Without
	// this, a rule anchored on a bare class (`.date-range__picker`) outlives its test and can style
	// a later fixture, making the result depend on execution order.
	afterEach( () => {
		document.head.querySelectorAll( 'style' ).forEach( ( style ) => style.remove() );
		document.body.innerHTML = '';
	} );

	it( 'scopes a shared component selector under both .jp-stats-dashboard and .jp-stats-widget, but not outside either', () => {
		// Distinctive non-default color, so a passing assertion actually proves the rule applied.
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

		expect( getComputedStyle( widgetRoot ).color ).toBe( 'green' );

		widgetRoot.classList.add( 'is-ready' );
		expect( getComputedStyle( widgetRoot ).color ).toBe( 'red' );
	} );

	it( 'does not prefix an unrelated selector that merely starts with the widget class name', () => {
		const compiled = compile( '.jp-stats-widget-extra { color: blue; }' );

		expect( compiled ).toContain( ':where(' );
		expect( compiled ).not.toMatch( /^\.jp-stats-widget-extra/m );
	} );

	it( 'leaves .jp-stats-dashboard matching the dashboard mount itself, and rules nested under it in source, unprefixed', () => {
		// Mirrors wp-admin.scss's `.jp-stats-dashboard { --sidebar-width-max: 160px; & .layout__content { ... } }`.
		const compiled = compile(
			'.jp-stats-dashboard { --sidebar-width-max: 160px; }\n' +
				'.jp-stats-dashboard .layout__content { padding-top: 0; }',
			{ from: 'odyssey-stats/src/styles/wp-admin.scss' }
		);
		document.body.innerHTML =
			'<div class="jp-stats-dashboard"><div class="layout__content" id="layout-content"></div></div>';
		const style = document.createElement( 'style' );
		style.textContent = compiled;
		document.head.appendChild( style );

		expect(
			getComputedStyle( document.querySelector( '.jp-stats-dashboard' ) ).getPropertyValue(
				'--sidebar-width-max'
			)
		).toBe( '160px' );
		expect( getComputedStyle( document.getElementById( 'layout-content' ) ).paddingTop ).toBe(
			'0px'
		);
	} );

	it( 'leaves app.scss (already hand-scoped to .jp-stats-dashboard) unprefixed', () => {
		const compiled = compile( '.jp-stats-dashboard .card { border: 0; }', {
			from: 'odyssey-stats/src/app.scss',
		} );

		expect( compiled.trim() ).toBe( '.jp-stats-dashboard .card { border: 0; }' );
	} );

	it( 'leaves .color-scheme.is-<scheme> unprefixed — it sets the scheme vars on the element that carries the class', () => {
		const compiled = compile( '.color-scheme.is-midnight { --color-accent: red; }' );

		expect( compiled ).not.toContain( ':where(' );
		expect( compiled ).toMatch( /^\.color-scheme\.is-midnight/m );
	} );

	it( 'still prefixes a nested rule under a colour scheme — only the self-scoping compound is exempt', () => {
		const compiled = compile( '.color-scheme.is-light .masterbar { color: green; }' );

		expect( compiled ).toContain( ':where(' );
	} );

	it( 'leaves .stats-widget-content.color-scheme unprefixed — the widget primary→accent remap on its own root', () => {
		const compiled = compile( '.stats-widget-content.color-scheme { --color-primary: red; }', {
			from: 'odyssey-stats/src/styles/scoped-theme-for-widget.scss',
		} );

		expect( compiled ).not.toContain( ':where(' );
		expect( compiled ).toMatch( /^\.stats-widget-content\.color-scheme/m );
	} );

	it( 'leaves the widget root unprefixed when compounded with a scheme, as the admin-theme handback is', () => {
		// The handback rule targets the widget's own root, so prefixing it would ask that element to
		// be its own descendant and the rule would die silently. Asserted separately from the bare
		// compound above: an exempt pattern anchored at `.color-scheme` alone still passes that one.
		const compiled = compile(
			'.stats-widget-content.color-scheme.is-coffee { --wp-admin-theme-color: inherit; }'
		);

		expect( compiled ).not.toContain( ':where(' );
		expect( compiled ).toMatch( /^\.stats-widget-content\.color-scheme\.is-coffee/m );
	} );

	it.each( [
		'body>.color-scheme',
		'body > .color-scheme',
		'body+.x',
		'body~.x',
		'.foo body .x',
		'html>body .x',
	] )( 'leaves `%s` unprefixed, whatever combinator spacing Sass emitted', ( selector ) => {
		const compiled = compile( `${ selector } { --color-accent: rgb(7, 8, 9); }` );

		expect( compiled.trim() ).toBe( `${ selector } { --color-accent: rgb(7, 8, 9); }` );
	} );

	// Excluding these to save their dead `body` branch would ship the live branches unscoped into
	// wp-admin, which is the worse trade — and the post-build check cannot see it, since it only
	// inspects rules that were prefixed. They stay prefixed instead; verify-css-scope.js reports the
	// ones that are dead outright as a build failure.
	it.each( [
		':is(.foo,body>.x) .card',
		':is(.foo>body,.admin-panel) .card',
		':is(html,body) .card',
	] )(
		'still prefixes `%s` — a root inside a matches-any group must not exclude the whole rule',
		( selector ) => {
			const compiled = compile( `${ selector } { color: red; }` );

			expect( compiled ).toContain( ':where(' );
		}
	);

	// The price of keeping the left side narrow enough to protect those mixed groups: a root after a
	// combinator is not excluded, so it is prefixed and dead. The safe direction — check 4 turns it
	// into a build failure, where an unscoped rule would pass unnoticed.
	it( 'prefixes `.foo>body .x`, leaving verify-css-scope.js to report it as dead', () => {
		const compiled = compile( '.foo>body .x { color: red; }' );

		expect( compiled ).toContain( ':where(' );
		expect(
			findScopeFailures( `${ compiled }\n.jp-stats-dashboard{--x:1}\n.jp-stats-widget{--y:2}` )
		).toEqual( [ expect.stringContaining( 'Dead rule found' ) ] );
	} );

	// Known limitation, unchanged by the combinator widening: whitespace before a root inside a
	// functional pseudo is indistinguishable from the descendant combinator in `.foo body .x`, which
	// `exclude` must keep matching. Separating them needs paren-awareness that a regex list cannot
	// express. No such selector exists in first-party SCSS; this pins the behaviour so a future
	// change to `exclude` shows up here rather than as a silent leak into wp-admin.
	it( 'over-matches a whitespace-separated root inside a functional pseudo, leaving it unscoped', () => {
		const compiled = compile( ':is(.foo, body .x) .card { color: red; }' );

		expect( compiled ).not.toContain( ':where(' );
	} );

	it( 'keeps a rule anchored on the Odyssey portal root applying to elements inside it', () => {
		const compiled = compile( 'body>.color-scheme .date-range__picker { color: rgb(7, 8, 9); }' );
		document.body.innerHTML =
			'<div class="color-scheme is-coffee"><div class="date-range__picker" id="picker"></div></div>';
		const style = document.createElement( 'style' );
		style.textContent = compiled;
		document.head.appendChild( style );

		expect( getComputedStyle( document.getElementById( 'picker' ) ).color ).toBe( 'rgb(7, 8, 9)' );
	} );

	// theme.scss emits the three `--wp-admin-theme-color*` properties on the portalled scheme root,
	// once per wp-admin scheme. They share the `body>` anchor with the picker rule and cover every
	// @wordpress/components control in a portal.
	// The two halves of the scoping contract are configured apart and only meet in the build:
	// webpack-css-scope.js decides what gets prefixed, verify-css-scope.js decides what counts as
	// dead. Compiling real source selectors and running the result through the checker is what ties
	// them together — it fails for any selector `exclude` mishandles, including forms nobody
	// anticipated. This case alone would have caught STATS-413 without knowing about `>`.
	it( 'produces no dead rules when the real source selectors are compiled and checked', () => {
		// The three-member rule from stats-main/style.scss, plus the other shapes `exclude` and the
		// prefix roots are meant to handle.
		const compiled = compile( `
			.stats-main,
			body>.color-scheme,
			body.is-section-stats .components-modal__screen-overlay { --color-accent: red; }
			body>.color-scheme.is-coffee { --wp-admin-theme-color: inherit; }
			html.rtl .stats-tab { margin: 0; }
			.card { color: blue; }
			.color-scheme.is-light .masterbar { color: green; }
		` );

		expect(
			findScopeFailures( `${ compiled }\n.jp-stats-dashboard{--x:1}\n.jp-stats-widget{--y:2}` )
		).toEqual( [] );
	} );

	it( 'leaves the admin-theme handback on the portalled scheme root unprefixed', () => {
		const compiled = compile( 'body>.color-scheme.is-coffee { --wp-admin-theme-color: inherit; }' );

		expect( compiled ).not.toContain( ':where(' );
	} );

	it( 'scopes content inside a @wordpress/components Popover fallback container, mirroring the modal/widget mounts', () => {
		const compiled = compile( '.card { color: rgb(4, 5, 6); }' );
		document.body.innerHTML =
			'<div class="components-popover__fallback-container"><div class="card" id="popover-card"></div></div>' +
			'<div id="adminmenu"><div class="card" id="adminmenu-card"></div></div>';
		const style = document.createElement( 'style' );
		style.textContent = compiled;
		document.head.appendChild( style );

		expect( getComputedStyle( document.getElementById( 'popover-card' ) ).color ).toBe(
			'rgb(4, 5, 6)'
		);
		expect( getComputedStyle( document.getElementById( 'adminmenu-card' ) ).color ).not.toBe(
			'rgb(4, 5, 6)'
		);
	} );

	it( 'leaves .components-tooltip unprefixed — @wordpress/components Tooltip has no attribute to scope its wrapper', () => {
		const compiled = compile( '.components-tooltip { color: red; }' );

		expect( compiled ).not.toContain( ':where(' );
		expect( compiled ).toMatch( /^\.components-tooltip/m );
	} );

	it( 'leaves the WebPreview modal root unprefixed — RootChild portals it into a classless body div', () => {
		const compiled = compile(
			'.web-preview { opacity: 0; }\n.web-preview.is-visible { opacity: 1; }',
			{ from: 'client/components/web-preview/style.scss' }
		);

		expect( compiled ).not.toContain( ':where(' );
		expect( compiled ).toMatch( /^\.web-preview \{/m );
		expect( compiled ).toMatch( /^\.web-preview\.is-visible/m );
	} );

	it( 'scopes WebPreview BEM descendants under the .web-preview root (STATS-393)', () => {
		const compiled = compile( '.web-preview__backdrop { color: rgb(7, 8, 9); }', {
			from: 'client/components/web-preview/style.scss',
		} );
		document.body.innerHTML =
			'<div><div class="web-preview"><div class="web-preview__backdrop" id="backdrop"></div></div></div>' +
			'<div id="adminmenu"><div class="web-preview__backdrop" id="adminmenu-backdrop"></div></div>';
		const style = document.createElement( 'style' );
		style.textContent = compiled;
		document.head.appendChild( style );

		expect( compiled ).toContain( ':where(' );
		expect( getComputedStyle( document.getElementById( 'backdrop' ) ).color ).toBe(
			'rgb(7, 8, 9)'
		);
		expect( getComputedStyle( document.getElementById( 'adminmenu-backdrop' ) ).color ).not.toBe(
			'rgb(7, 8, 9)'
		);
	} );
} );
