/**
 * @jest-environment jsdom
 */

const path = require( 'path' );
const postcss = require( 'postcss' );
const sass = require( 'sass' );

describe( 'Credits meter CSS contract', () => {
	const rules = [];
	const tokens = { light: {}, dark: {}, calypsoDark: {} };
	const ringStrokes = {};

	beforeAll( () => {
		const nodeModules = path.resolve( __dirname, '../../../node_modules' );
		const stylesheet = path.resolve(
			__dirname,
			'../../../packages/agents-manager/src/components/credits-meter/style.scss'
		);
		postcss
			.parse( sass.compile( stylesheet, { loadPaths: [ nodeModules ] } ).css )
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

		// The light chat under Calypso's dark scheme, whose mixin recolours its agenttic tokens.
		const scheme = sass.compileString(
			"@use 'dark-theme'; .scheme { @include dark-theme.color-scheme-dark-theme-tokens; @include dark-theme.color-scheme-dark-theme-agenttic; }",
			{ loadPaths: [ path.resolve( __dirname, '../../../client/lib/color-scheme' ), nodeModules ] }
		);
		tokens.calypsoDark = { ...tokens.light };
		postcss.parse( scheme.css ).walkRules( /^\.scheme( \.agenttic)?$/, ( rule ) => {
			rule.walkDecls( /^--/, ( declaration ) => {
				tokens.calypsoDark[ declaration.prop ] = declaration.value.replace( /\s+/g, ' ' );
			} );
		} );

		const ringFile = path.resolve(
			__dirname,
			'../../../packages/agenttic-ui/src/components/ui/progress-ring.module.css'
		);
		postcss.parse( sass.compile( ringFile ).css ).walkRules( ( rule ) => {
			rule.walkDecls( 'stroke', ( declaration ) => {
				ringStrokes[ rule.selector ] = declaration.value;
			} );
		} );
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
	// Calypso's dark scheme has no design values, so it joins only the checks that hold in any palette.
	const allThemes = [ ...themes, 'calypsoDark' ];
	const ring = '.agents-manager-credits-meter__ring';
	const TRACK = '.track';
	// `CreditsMeter` draws the ring with `tone="primary"`, whose arc keeps `.fill`'s stroke.
	const ARC = '.fill';

	// The colour the ring draws `part` in. At each `var()`, a value our stylesheet sets on the ring,
	// or on an element it inherits from, wins over the fallback and agenttic's token.
	const drawn = ( part, state, theme ) => {
		const options = { dark: theme === 'dark', ...state };
		const declared = ( variable ) =>
			[ ring, '.agents-manager-credits-meter__toggle', '.agents-manager-credits-meter' ]
				.map( ( target ) => resolve( variable, options, target ) )
				.find( ( value ) => value !== undefined );
		const substitute = ( value ) => {
			const [ , variable, fallback ] =
				value.match( /^\s*var\(\s*(--[\w-]+)\s*(?:,(.*))?\)\s*$/ ) ?? [];
			if ( ! variable ) {
				return value;
			}
			const next = declared( variable ) ?? fallback;
			return next ? substitute( next ) : value;
		};
		return evaluate( substitute( ringStrokes[ part ] ), theme );
	};

	// What the ring sits on: the toggle's translucent background, if any, over the composer.
	const backdrop = ( state, theme ) => {
		const composer = evaluate( 'var(--color-popover-muted)', theme );
		const background = resolve( 'background-color', { dark: theme === 'dark', ...state } );
		if ( ! background ) {
			return composer;
		}
		const [ r, g, b, alpha ] = evaluate( background, theme );
		return [ r, g, b ].map( ( c, i ) => c * alpha + composer[ i ] * ( 1 - alpha ) ).concat( 1 );
	};

	// Light's track is 1.03:1 from Figma's #e0e0e0, and dark's arc 1.03:1 from its #3858e9: the
	// designer asked for the Upgrade button's blue. Figma doesn't draw the dark hover.
	const DESIGN = {
		light: { arc: '#2d5af2', track: '#e3e3e3', emptyRing: '#757575', hover: '#f1f1f1' },
		dark: { arc: '#2d5af2', track: '#3d3d3d', emptyRing: '#8f8f8f', hover: '#333333' },
	};
	const STATES = { 'at rest': {}, 'on hover': { hover: true }, 'when open': { open: true } };
	const ACTIVE_STATES = { 'on hover': { hover: true }, 'when open': { open: true } };
	const mapStates = ( states, callback ) =>
		Object.fromEntries(
			Object.entries( states ).map( ( [ name, state ] ) => [ name, callback( state ) ] )
		);

	// One case per theme and state, so a failure names both.
	const eachState = ( states ) =>
		allThemes.flatMap( ( theme ) =>
			Object.entries( states ).map( ( [ name, state ] ) => [ theme, name, state ] )
		);

	// Our stylesheet recolours the empty ring through this variable, so agenttic-ui must keep reading it.
	it( 'draws the ring track from --color-progress-ring-track, falling back to the input border', () => {
		expect( ringStrokes[ TRACK ] ).toMatch(
			/^var\(\s*--color-progress-ring-track\s*,\s*var\(\s*--color-input-border\s*\)\s*\)$/
		);
	} );

	// A default would recolour every ring, the demo's included, so only hosts set it.
	it.each( themes )(
		'leaves the ring’s track variable unset in agenttic’s default %s tokens',
		( theme ) => {
			expect( tokens[ theme ] ).not.toHaveProperty( [ '--color-progress-ring-track' ] );
		}
	);

	it( 'colours the empty ring and the toggle’s hover with agenttic tokens only', () => {
		[
			resolve( '--color-progress-ring-track', { empty: true }, ring ),
			resolve( 'background-color', { hover: true } ),
			resolve( 'background-color', { dark: true, hover: true } ),
		].forEach( ( value ) => {
			expect( value.replace( /var\(\s*--color-[\w-]+\s*\)/g, '' ) ).not.toMatch(
				/#|\b(rgba?|hsla?|var)\(/
			);
		} );
	} );

	it.each( themes )(
		'draws each part of the ring in the design’s colours in every state in %s',
		( theme ) => {
			const { arc, track, emptyRing } = DESIGN[ theme ];
			expect(
				mapStates( STATES, ( state ) => ( {
					arc: hex( drawn( ARC, state, theme ) ),
					track: hex( drawn( TRACK, state, theme ) ),
					emptyRing: hex( drawn( TRACK, { ...state, empty: true }, theme ) ),
				} ) )
			).toEqual( mapStates( STATES, () => ( { arc, track, emptyRing } ) ) );
		}
	);

	it.each( themes )(
		'tints the toggle over the composer on hover and when open in the design’s grey in %s',
		( theme ) => {
			expect( mapStates( ACTIVE_STATES, ( state ) => hex( backdrop( state, theme ) ) ) ).toEqual(
				mapStates( ACTIVE_STATES, () => DESIGN[ theme ].hover )
			);
		}
	);

	it.each( eachState( STATES ) )(
		'keeps an empty ring at 3:1 on what sits behind it in %s %s',
		( theme, _, state ) => {
			expect(
				contrast( drawn( TRACK, { ...state, empty: true }, theme ), backdrop( state, theme ) )
			).toBeGreaterThanOrEqual( 3 );
		}
	);

	it.each( eachState( STATES ) )(
		'draws an empty ring stronger than a partly full ring’s track in %s %s',
		( theme, _, state ) => {
			const behind = backdrop( state, theme );
			expect(
				contrast( drawn( TRACK, { ...state, empty: true }, theme ), behind )
			).toBeGreaterThan( contrast( drawn( TRACK, state, theme ), behind ) );
		}
	);

	it.each( eachState( ACTIVE_STATES ) )(
		'keeps a partly full ring’s track apart from the toggle’s tint in %s %s',
		( theme, _, state ) => {
			expect( hex( drawn( TRACK, state, theme ) ) ).not.toBe( hex( backdrop( state, theme ) ) );
		}
	);

	it( 'draws the popover’s 0% in the error red', () => {
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
