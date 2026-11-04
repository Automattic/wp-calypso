/**
 * @jest-environment jsdom
 */

const path = require( 'path' );
const postcss = require( 'postcss' );
const sass = require( 'sass' );

describe( 'Credits meter CSS contract', () => {
	const rules = [];
	const tokens = { light: {}, dark: {} };

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

		const tokensFile = path.resolve(
			__dirname,
			'../../../packages/agenttic-ui/src/styles/tokens.css'
		);
		postcss.parse( sass.compile( tokensFile ).css ).walkRules( ( rule ) => {
			const theme = { '.agenttic': 'light', '.agenttic.dark': 'dark' }[ rule.selector ];
			if ( theme ) {
				rule.walkDecls( /^--/, ( declaration ) => {
					tokens[ theme ][ declaration.prop ] = declaration.value;
				} );
			}
		} );
		tokens.dark = { ...tokens.light, ...tokens.dark };
	} );

	// Counts classes, attributes and pseudo-classes only; `:not(x)` counts as x.
	const specificity = ( selector ) =>
		selector.replace( /:not\(([^)]*)\)/g, '$1' ).match( /\.[\w-]+|\[[^\]]+\]|:[\w-]+/g )?.length ??
		0;

	// The winning value of `prop` on `target`; `[data-hover]` stands in for `:hover`.
	const resolve = (
		prop,
		{ dark = false, hover = false, open = false, empty = false } = {},
		target = 'button'
	) => {
		const root = document.createElement( 'div' );
		root.className = dark ? 'agenttic dark' : 'agenttic';
		root.innerHTML = `<div class="agents-manager-credits-meter"><button class="agents-manager-credits-meter__toggle components-button" aria-expanded="${ open }"${
			hover ? ' data-hover' : ''
		}><svg class="agents-manager-credits-meter__ring${
			empty ? ' agents-manager-credits-meter__ring--empty' : ''
		}" data-slot="progress-ring"></svg></button><span class="agents-manager-credits-meter__pool-percent is-exhausted"></span></div>
		<div class="agents-manager-credits-meter__pool is-balance-only"><span class="agents-manager-credits-meter__pool-label"></span><span class="agents-manager-credits-meter__pool-date"></span><span class="agents-manager-credits-meter__pool-detail"></span></div>
		<p class="agents-manager-credits-meter__message"></p><a class="agents-manager-credits-meter__manage components-button"></a>`;
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

	// A colour as [ r, g, b, alpha ], with agenttic tokens and srgb `color-mix()` worked out.
	const evaluate = ( value, theme ) => {
		const css = value.trim();
		const token = css.match( /^var\(\s*(--[\w-]+)\s*\)$/ );
		if ( token ) {
			return evaluate( tokens[ theme ][ token[ 1 ] ], theme );
		}
		if ( css === 'transparent' ) {
			return [ 0, 0, 0, 0 ];
		}
		if ( /^#[\da-f]{3}$/i.test( css ) ) {
			return evaluate( css.replace( /[\da-f]/gi, '$&$&' ), theme );
		}
		if ( /^#[\da-f]{6}$/i.test( css ) ) {
			return [ 1, 3, 5 ].map( ( i ) => parseInt( css.slice( i, i + 2 ), 16 ) ).concat( 1 );
		}
		const mix = css.match( /^color-mix\(\s*in srgb\s*,(.*)\)$/ );
		if ( ! mix ) {
			throw new Error( `Can't evaluate ${ css }` );
		}
		const [ a, b ] = mix[ 1 ].split( /,(?![^(]*\))/ ).map( ( part ) => {
			const [ , color, percent ] = part.trim().match( /^(.*?)(?:\s+([\d.]+)%)?$/ );
			return { color: evaluate( color, theme ), weight: percent && percent / 100 };
		} );
		a.weight ??= 1 - b.weight;
		b.weight ??= 1 - a.weight;
		const alpha = a.color[ 3 ] * a.weight + b.color[ 3 ] * b.weight;
		return [ 0, 1, 2 ]
			.map(
				( i ) =>
					( a.color[ i ] * a.color[ 3 ] * a.weight + b.color[ i ] * b.color[ 3 ] * b.weight ) /
					alpha
			)
			.concat( alpha );
	};

	const luminance = ( rgb ) =>
		rgb
			.slice( 0, 3 )
			.map( ( c ) => c / 255 )
			.map( ( c ) => ( c <= 0.03928 ? c / 12.92 : ( ( c + 0.055 ) / 1.055 ) ** 2.4 ) )
			.reduce( ( sum, c, i ) => sum + c * [ 0.2126, 0.7152, 0.0722 ][ i ], 0 );
	const contrast = ( a, b ) => {
		const [ high, low ] = [ luminance( a ), luminance( b ) ].sort( ( x, y ) => y - x );
		return ( high + 0.05 ) / ( low + 0.05 );
	};
	const hex = ( rgb ) =>
		'#' +
		rgb
			.slice( 0, 3 )
			.map( ( c ) => Math.round( c ).toString( 16 ).padStart( 2, '0' ) )
			.join( '' );

	const themes = [ 'light', 'dark' ];
	const ring = '.agents-manager-credits-meter__ring';

	it.each( [
		[ 'on hover', { hover: true } ],
		[ 'when open', { open: true } ],
	] )( 'keeps the ring’s track apart from the toggle’s background %s', ( _, state ) => {
		themes.forEach( ( theme ) => {
			const dark = theme === 'dark';
			const track = resolve( '--color-input-border', { dark, ...state }, ring );
			const background = resolve( 'background-color', { dark, ...state } );
			expect( track ).toMatch( /^var\(\s*--color-[\w-]+\s*\)$/ );
			expect( hex( evaluate( track, theme ) ) ).not.toBe( hex( evaluate( background, theme ) ) );
		} );
	} );

	it( 'draws an empty ring’s track a shade stronger at rest, on hover and when open', () => {
		[ {}, { hover: true }, { open: true } ].forEach( ( state ) => {
			themes.forEach( ( theme ) => {
				const dark = theme === 'dark';
				const track = resolve( '--color-input-border', { dark, empty: true, ...state }, ring );
				// The toggle has no background at rest, so the composer's shows through.
				const surface = evaluate(
					resolve( 'background-color', { dark, ...state } ) ?? 'var(--color-background)',
					theme
				);
				expect( track ).toMatch( /^var\(\s*--color-[\w-]+\s*\)$/ );
				expect( contrast( evaluate( track, theme ), surface ) ).toBeGreaterThan(
					contrast( evaluate( 'var(--color-input-border)', theme ), surface )
				);
			} );
		} );
	} );

	it( 'draws the popover’s 0% left in the error red', () => {
		const percent = '.agents-manager-credits-meter__pool-percent';
		themes.forEach( ( theme ) => {
			expect( resolve( 'color', { dark: theme === 'dark' }, percent ) ).toBe(
				'var(--color-error-strong)'
			);
		} );
	} );

	it.each( themes )( 'keeps the popover’s secondary text at 4.5:1 in %s', ( theme ) => {
		const dark = theme === 'dark';
		const popover = evaluate( 'var(--color-popover)', theme );
		[
			'.agents-manager-credits-meter__pool-label',
			'.agents-manager-credits-meter__pool-date',
			'.agents-manager-credits-meter__pool-detail',
			'.agents-manager-credits-meter__message',
			'.agents-manager-credits-meter__manage',
		].forEach( ( target ) => {
			const text = evaluate( resolve( 'color', { dark }, target ), theme );
			expect( [ target, contrast( text, popover ) >= 4.5 ] ).toEqual( [ target, true ] );
		} );
	} );
} );
