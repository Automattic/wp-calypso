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
		{ dark = false, alert = false, hover = false, open = false } = {},
		target = 'button'
	) => {
		const root = document.createElement( 'div' );
		root.className = dark ? 'agenttic dark' : 'agenttic';
		root.innerHTML = `<div class="agents-manager-credits-meter"><button class="agents-manager-credits-meter__toggle components-button${
			alert ? ' is-alert' : ''
		}" aria-expanded="${ open }"${
			hover ? ' data-hover' : ''
		}></button><span class="agents-manager-credits-meter__pool-percent is-exhausted"></span></div>
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

	const over = ( [ r, g, b, alpha ], base ) =>
		[ r, g, b ].map( ( c, i ) => c * alpha + base[ i ] * ( 1 - alpha ) );
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
	const alertStates = [
		[ 'at rest', {} ],
		[ 'on hover', { hover: true } ],
		[ 'when open', { open: true } ],
	];

	it.each( alertStates )( 'keeps the alert toggle on the Figma tint %s', ( _, state ) => {
		themes.forEach( ( theme ) => {
			const tint = evaluate(
				resolve( 'background-color', { alert: true, dark: theme === 'dark', ...state } ),
				theme
			);
			expect( hex( tint ) ).toBe( '#e7000b' );
			expect( tint[ 3 ] ).toBeCloseTo( 0.2 );
		} );
	} );

	it.each( alertStates )( 'draws the alert glyph in the Figma red %s', ( _, state ) => {
		const glyph = ( theme ) =>
			hex(
				evaluate( resolve( 'color', { alert: true, dark: theme === 'dark', ...state } ), theme )
			);
		expect( glyph( 'light' ) ).toBe( '#e7000b' );
		expect( glyph( 'dark' ) ).toBe( '#f87171' );
	} );

	it( 'takes the alert red from an agenttic token', () => {
		themes.forEach( ( theme ) => {
			expect( resolve( 'color', { alert: true, dark: theme === 'dark' } ) ).toMatch(
				/^var\(--color-[\w-]+\)$/
			);
		} );
	} );

	it.each( themes )( 'keeps the alert glyph at 3:1 on its tint in %s', ( theme ) => {
		const dark = theme === 'dark';
		const tint = over(
			evaluate( resolve( 'background-color', { alert: true, dark } ), theme ),
			evaluate( 'var(--color-background)', theme )
		);
		const glyph = evaluate( resolve( 'color', { alert: true, dark } ), theme );
		expect( contrast( glyph, tint ) ).toBeGreaterThanOrEqual( 3 );
	} );

	it( 'draws the popover’s 0% left in the same red as the alert glyph', () => {
		const percent = '.agents-manager-credits-meter__pool-percent';
		themes.forEach( ( theme ) => {
			const dark = theme === 'dark';
			expect( resolve( 'color', { dark }, percent ) ).toBe(
				resolve( 'color', { alert: true, dark } )
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
