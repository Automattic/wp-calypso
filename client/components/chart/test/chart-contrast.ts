/**
 * @jest-environment node
 */
import fs from 'fs';
import path from 'path';

const REPO_ROOT = path.resolve( __dirname, '../../../..' );
const SCHEME_DIR = path.join(
	REPO_ROOT,
	'packages/calypso-color-schemes/src/shared/color-schemes'
);
const PALETTE = path.join( REPO_ROOT, 'packages/calypso-color-schemes/src/shared/_colors.scss' );
const COLOR_STUDIO = path.join(
	REPO_ROOT,
	'packages/calypso-color-schemes/src/__color-studio/color-properties.css'
);
const CHART_STYLE = path.join( REPO_ROOT, 'client/components/chart/style.scss' );
const LINE_CHART = path.join( REPO_ROOT, 'client/my-sites/stats/stats-chart-tabs/index.jsx' );
const WIDGET_CHART = path.join( REPO_ROOT, 'apps/odyssey-stats/src/widget/mini-chart.scss' );

const MIN_RATIO = 3;

const readDeclarations = ( file: string ) => {
	const map = new Map< string, string >();
	for ( const line of fs.readFileSync( file, 'utf8' ).split( '\n' ) ) {
		const match = line.match( /^\s*(--[\w-]+):\s*([^;]+);/ );
		if ( match ) {
			map.set( match[ 1 ], match[ 2 ].trim() );
		}
	}
	return map;
};

const luminance = ( hex: string ) => {
	const channels = [ 0, 2, 4 ].map(
		( offset ) => parseInt( hex.slice( offset + 1, offset + 3 ), 16 ) / 255
	);
	const [ r, g, b ] = channels.map( ( c ) =>
		c <= 0.03928 ? c / 12.92 : ( ( c + 0.055 ) / 1.055 ) ** 2.4
	);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = ( a: string, b: string ) => {
	const [ hi, lo ] = [ luminance( a ), luminance( b ) ].sort( ( x, y ) => y - x );
	return ( hi + 0.05 ) / ( lo + 0.05 );
};

const palette = readDeclarations( PALETTE );
const colorStudio = readDeclarations( COLOR_STUDIO );
const schemes = new Map< string, Map< string, string > >();
for ( const file of fs.readdirSync( SCHEME_DIR ).sort() ) {
	if ( file.endsWith( '.scss' ) ) {
		schemes.set(
			file.replace( /^_|\.scss$/g, '' ),
			readDeclarations( path.join( SCHEME_DIR, file ) )
		);
	}
}

const resolve = ( value: string, scheme: string, depth = 0 ): string | null => {
	if ( depth > 15 ) {
		return null;
	}
	const trimmed = value.trim();
	if ( /^#[0-9a-f]{6}$/i.test( trimmed ) ) {
		return trimmed.toLowerCase();
	}
	if ( /^#[0-9a-f]{3}$/i.test( trimmed ) ) {
		return `#${ trimmed
			.slice( 1 )
			.split( '' )
			.map( ( c ) => c + c )
			.join( '' ) }`;
	}
	const reference = trimmed.match( /^var\(\s*(--[\w-]+)/ );
	if ( ! reference ) {
		return null;
	}
	const sources = [
		schemes.get( scheme ),
		schemes.get( 'global' ),
		schemes.get( 'default' ),
		palette,
		colorStudio,
	];
	for ( const source of sources ) {
		if ( source?.has( reference[ 1 ] ) ) {
			const resolved = resolve( source.get( reference[ 1 ] ) as string, scheme, depth + 1 );
			if ( resolved ) {
				return resolved;
			}
		}
	}
	return null;
};

const tokenValue = ( scheme: string, token: string ) => {
	for ( const source of [ schemes.get( scheme ), schemes.get( 'default' ) ] ) {
		if ( source?.has( token ) ) {
			const resolved = resolve( source.get( token ) as string, scheme );
			if ( resolved ) {
				return resolved;
			}
		}
	}
	throw new Error( `Could not resolve ${ token } for scheme ${ scheme }` );
};

const chartStyle = fs.readFileSync( CHART_STYLE, 'utf8' );

const topLevelBlock = ( selector: string ) => {
	const start = chartStyle.search( new RegExp( `^\\${ selector } \\{$`, 'm' ) );
	if ( start === -1 ) {
		throw new Error( `No top-level block for ${ selector } in chart/style.scss` );
	}
	return chartStyle.slice( start, chartStyle.indexOf( '\n}', start ) );
};

const backgroundToken = ( block: string, label: string ) => {
	const match = block.match( /background(?:-color)?:\s*var\(\s*(--[\w-]+)\s*\)/ );
	if ( ! match ) {
		throw new Error( `No background custom property found for ${ label }` );
	}
	return match[ 1 ];
};

const legendBlock = chartStyle.slice(
	chartStyle.indexOf( '.chart__legend-color {' ),
	chartStyle.indexOf( '.chart__legend-checkbox' )
);

const SERIES = {
	viewsBar: backgroundToken( topLevelBlock( '.chart__bar-section' ), 'views bar' ),
	visitorsBar: backgroundToken( topLevelBlock( '.chart__bar-section-inner' ), 'visitors bar' ),
	viewsSwatch: backgroundToken( legendBlock, 'views legend swatch' ),
	visitorsSwatch: backgroundToken(
		legendBlock.slice( legendBlock.indexOf( '&.is-secondary' ) ),
		'visitors legend swatch'
	),
};

const schemeNames = [ ...schemes.keys() ];

describe( 'Stats chart series colours meet WCAG 1.4.11', () => {
	it.each( schemeNames )( 'bar chart passes 3:1 in the %s scheme', ( scheme ) => {
		const surface = tokenValue( scheme, '--color-surface' );
		const views = tokenValue( scheme, SERIES.viewsBar );
		const visitors = tokenValue( scheme, SERIES.visitorsBar );

		expect( contrast( views, surface ) ).toBeGreaterThanOrEqual( MIN_RATIO );
		expect( contrast( visitors, surface ) ).toBeGreaterThanOrEqual( MIN_RATIO );
		expect( contrast( views, visitors ) ).toBeGreaterThanOrEqual( MIN_RATIO );
	} );

	it( 'legend swatches use the same tokens as the bars they label', () => {
		expect( SERIES.viewsSwatch ).toBe( SERIES.viewsBar );
		expect( SERIES.visitorsSwatch ).toBe( SERIES.visitorsBar );
	} );

	it.each( schemeNames )( 'line chart passes 3:1 in the %s scheme', ( scheme ) => {
		const source = fs.readFileSync( LINE_CHART, 'utf8' );
		const tokens = [ ...source.matchAll( /useCssVariable\(\s*'(--[\w-]+)'/g ) ].map(
			( m ) => m[ 1 ]
		);
		expect( tokens ).toHaveLength( 2 );

		const surface = tokenValue( scheme, '--color-surface' );
		const [ views, visitors ] = tokens.map( ( token ) => tokenValue( scheme, token ) );

		expect( contrast( views, surface ) ).toBeGreaterThanOrEqual( MIN_RATIO );
		expect( contrast( visitors, surface ) ).toBeGreaterThanOrEqual( MIN_RATIO );
		expect( contrast( views, visitors ) ).toBeGreaterThanOrEqual( MIN_RATIO );
	} );

	it( 'Odyssey widget mini-chart does not override the shared series colours', () => {
		const source = fs.readFileSync( WIDGET_CHART, 'utf8' );
		expect( source ).not.toMatch( /--color-primary/ );
		expect( source ).not.toMatch( /\.chart__bar-section-inner\s*\{/ );
		expect( source ).not.toMatch( /&\.is-secondary\s*\{/ );
	} );
} );
