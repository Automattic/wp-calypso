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
 * Same as `compile`, but through the narrower `vendorPrefix` scope applied only to our bundled
 * wordpress-components base CSS (see webpack-css-scope.js's `vendorPrefix` and
 * webpack.config.js's second `prefixSelectorPlugin` instance).
 */
function compileVendor( css, { from } = {} ) {
	return postcss( [
		prefixSelectorPlugin( {
			prefix: cssScope.vendorPrefix,
			includeFiles: cssScope.vendorIncludeFiles,
			exclude: cssScope.exclude,
			transform: cssScope.vendorTransform,
		} ),
	] ).process( css, { from } ).css;
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

	it( 'leaves our bundled @wordpress/components base CSS unprefixed under the main scope — it gets its own narrower one instead', () => {
		const compiled = compile( '.components-modal__frame { padding: 24px; }', {
			from: 'node_modules/@wordpress/components/build-style/style.css',
		} );

		expect( compiled ).not.toContain( ':where(' );
	} );

	it( 'leaves other third-party node_modules CSS unprefixed', () => {
		const compiled = compile( '.some-other-package { color: red; }', {
			from: 'node_modules/some-other-package/style.css',
		} );

		expect( compiled ).not.toContain( ':where(' );
		expect( compiled ).toMatch( /^\.some-other-package/m );
	} );

	describe( 'vendorPrefix (our bundled @wordpress/components base CSS)', () => {
		const from = 'node_modules/@wordpress/components/build-style/style.css';

		it( "does NOT scope to .components-modal__screen-overlay alone — wp-admin's own Modal instances (e.g. the command palette) carry that class too", () => {
			// Mirrors the package's own Modal styling, which — left unscoped entirely — matched
			// wp-admin's own instance of the same component since both ship the same
			// unnamespaced class names. .components-modal__screen-overlay can't be the anchor
			// here (unlike in the main `prefix`) because it's on the shared overlay wrapper
			// every Modal gets, ours and core's alike.
			const compiled = compileVendor( '.components-modal__frame { padding: 24px; }', { from } );
			document.body.innerHTML =
				'<div class="components-modal__screen-overlay"><div class="components-modal__frame" id="core-command-palette"></div></div>';
			const style = document.createElement( 'style' );
			style.textContent = compiled;
			document.head.appendChild( style );

			expect(
				getComputedStyle( document.getElementById( 'core-command-palette' ) ).padding
			).not.toBe( '24px' );
		} );

		it( 'scopes to .is-odyssey-stats — the marker our own Modal instances add via overlayClassName', () => {
			const compiled = compileVendor( '.components-modal__frame { padding: 24px; }', { from } );
			// @wordpress/components applies `overlayClassName` to the same element that carries
			// .components-modal__screen-overlay, so a real Odyssey modal's overlay carries both.
			document.body.innerHTML =
				'<div class="components-modal__screen-overlay is-odyssey-stats"><div class="components-modal__frame" id="odyssey-modal"></div></div>';
			const style = document.createElement( 'style' );
			style.textContent = compiled;
			document.head.appendChild( style );

			expect( getComputedStyle( document.getElementById( 'odyssey-modal' ) ).padding ).toBe(
				'24px'
			);
		} );

		it( 'leaves other third-party node_modules CSS untouched — includeFiles limits it to our own vendor copy', () => {
			const compiled = compileVendor( '.some-other-package { color: red; }', {
				from: 'node_modules/some-other-package/style.css',
			} );

			expect( compiled ).not.toContain( ':where(' );
			expect( compiled ).toMatch( /^\.some-other-package/m );
		} );

		describe( '.components-modal__screen-overlay itself (STATS-251 regression: the overlay styles its own element, not a descendant)', () => {
			// overlayClassName lands on the exact same div as .components-modal__screen-overlay, and
			// that div is a direct child of <body> (Modal always portals straight there) — no
			// ancestor of it ever carries a vendorPrefix root. A rule staying in the default
			// ancestor-prefixed form here (`:where(vendorPrefix) .components-modal__screen-overlay`)
			// would be permanently dead, since nothing can ever be an ancestor of an element carrying
			// its own marker class.
			const overlayRule = '.components-modal__screen-overlay { position: fixed; }';

			it( 'applies to our own modal — .is-odyssey-stats is compounded onto the selector itself, not required as an ancestor', () => {
				const compiled = compileVendor( overlayRule, { from } );
				document.body.innerHTML =
					'<div class="components-modal__screen-overlay is-odyssey-stats" id="odyssey-overlay"></div>';
				const style = document.createElement( 'style' );
				style.textContent = compiled;
				document.head.appendChild( style );

				expect( getComputedStyle( document.getElementById( 'odyssey-overlay' ) ).position ).toBe(
					'fixed'
				);
			} );

			it( "does NOT apply to wp-admin's own instance (e.g. the command palette), which never carries .is-odyssey-stats", () => {
				const compiled = compileVendor( overlayRule, { from } );
				document.body.innerHTML =
					'<div class="components-modal__screen-overlay" id="core-overlay"></div>';
				const style = document.createElement( 'style' );
				style.textContent = compiled;
				document.head.appendChild( style );

				expect( getComputedStyle( document.getElementById( 'core-overlay' ) ).position ).not.toBe(
					'fixed'
				);
			} );

			it( 'still applies through the .is-animating-out compound, and still scopes a real descendant selector chained after it', () => {
				const compiled = compileVendor(
					'.components-modal__screen-overlay.is-animating-out { opacity: 0; }\n' +
						'.components-modal__screen-overlay.is-animating-out .components-modal__frame { animation-name: disappear; }',
					{ from }
				);
				document.body.innerHTML =
					'<div class="components-modal__screen-overlay is-animating-out is-odyssey-stats">' +
					'<div class="components-modal__frame" id="odyssey-frame"></div></div>';
				const style = document.createElement( 'style' );
				style.textContent = compiled;
				document.head.appendChild( style );

				const overlay = document.querySelector( '.components-modal__screen-overlay' );
				expect( getComputedStyle( overlay ).opacity ).toBe( '0' );
				expect( getComputedStyle( document.getElementById( 'odyssey-frame' ) ).animationName ).toBe(
					'disappear'
				);
			} );
		} );
	} );
} );
