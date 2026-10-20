/**
 * @jest-environment jsdom
 */

const path = require( 'path' );
const postcss = require( 'postcss' );
const sass = require( 'sass' );

describe( 'Credits meter toggle CSS contract', () => {
	const rules = [];

	beforeAll( () => {
		const stylesheet = path.resolve(
			__dirname,
			'../../../packages/agents-manager/src/components/credits-meter/style.scss'
		);
		postcss
			.parse(
				sass.compile( stylesheet, {
					loadPaths: [ path.resolve( __dirname, '../../../node_modules' ) ],
				} ).css
			)
			.walkRules( ( rule ) => {
				rules.push( rule );
			} );
	} );

	// Counts classes, attributes and pseudo-classes only; `:not(x)` counts as x.
	const specificity = ( selector ) =>
		selector.replace( /:not\(([^)]*)\)/g, '$1' ).match( /\.[\w-]+|\[[^\]]+\]|:[\w-]+/g )?.length ??
		0;

	// The winning value of `prop` on `target`; `[data-hover]` stands in for `:hover`.
	const resolve = (
		prop,
		{ dark = false, alert = false, hover = false, open = false } = {},
		target = 'button'
	) => {
		const root = document.createElement( 'div' );
		root.className = dark ? 'agenttic dark' : 'agenttic';
		root.innerHTML = `<div class="agents-manager-credits-meter"><button class="agents-manager-credits-meter__toggle components-button${
			alert ? ' is-alert' : ''
		}" aria-expanded="${ open }"${
			hover ? ' data-hover' : ''
		}></button><span class="agents-manager-credits-meter__pool-percent is-exhausted"></span></div>`;
		const toggle = root.querySelector( target );

		let winner;
		rules.forEach( ( rule, order ) => {
			let value;
			rule.walkDecls( prop, ( declaration ) => {
				value = declaration.value;
			} );
			if ( value === undefined ) {
				return;
			}
			rule.selectors
				.filter( ( selector ) => ! selector.includes( ':focus' ) )
				.forEach( ( selector ) => {
					if ( ! toggle.matches( selector.replace( /:hover/g, '[data-hover]' ) ) ) {
						return;
					}
					const weight = specificity( selector );
					if (
						! winner ||
						weight > winner.weight ||
						( weight === winner.weight && order > winner.order )
					) {
						winner = { weight, order, value };
					}
				} );
		} );
		return winner?.value;
	};

	const alertStates = [
		[ 'at rest', {} ],
		[ 'on hover', { hover: true } ],
		[ 'when open', { open: true } ],
	];

	it.each( alertStates )( 'keeps the alert toggle on the Figma tint %s', ( _, state ) => {
		expect( resolve( 'background-color', { alert: true, ...state } ) ).toBe(
			'color-mix(in srgb, var(--color-error-accent) 20%, transparent)'
		);
		expect( resolve( 'background-color', { alert: true, dark: true, ...state } ) ).toBe(
			'color-mix(in srgb, var(--color-error-accent) 20%, transparent)'
		);
	} );

	it.each( alertStates )( 'draws the light alert glyph in the error red %s', ( _, state ) => {
		expect( resolve( 'color', { alert: true, ...state } ) ).toBe( 'var(--color-error-accent)' );
	} );

	it.each( alertStates )( 'draws the dark alert glyph in the Figma red %s', ( _, state ) => {
		expect( resolve( 'color', { alert: true, dark: true, ...state } ) ).toBe( '#f87171' );
	} );

	it( 'draws the popover’s 0% left in the same red as the alert glyph', () => {
		const percent = '.agents-manager-credits-meter__pool-percent';
		expect( resolve( 'color', {}, percent ) ).toBe( 'var(--color-error-accent)' );
		expect( resolve( 'color', { dark: true }, percent ) ).toBe( '#f87171' );
	} );

	it( 'leaves the info toggle glyph on the muted token in dark', () => {
		expect( resolve( 'color', { dark: true } ) ).toBe( 'var(--color-muted-foreground)' );
	} );

	it( 'still highlights the info toggle on hover', () => {
		expect( resolve( 'background-color', { hover: true } ) ).toBe( 'var(--color-muted)' );
		expect( resolve( 'color', { hover: true } ) ).toBe( 'var(--color-foreground)' );
	} );
} );
