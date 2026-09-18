/**
 * @jest-environment node
 */
import fs from 'fs';
import path from 'path';
import chroma from 'chroma-js';
import postcssScss from 'postcss-scss';
import type postcss from 'postcss';

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
	const root = postcssScss.parse( fs.readFileSync( file, 'utf8' ) );
	root.walkDecls( /^--/, ( decl ) => {
		map.set( decl.prop, decl.value.trim() );
	} );
	return map;
};

const contrast = ( a: string, b: string ) => chroma.contrast( a, b );

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
	const sources = [ schemes.get( scheme ), schemes.get( 'default' ), palette, colorStudio ];
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
const chartStyleRoot = postcssScss.parse( chartStyle );

const directRule = ( container: postcss.Container, selector: string ) => {
	const found = container.nodes?.find(
		( node ): node is postcss.Rule => node.type === 'rule' && node.selector === selector
	);
	if ( ! found ) {
		throw new Error( `No rule found for ${ selector } in chart/style.scss` );
	}
	return found;
};

const backgroundToken = ( rule: postcss.Rule, label: string ) => {
	let token: string | null = null;
	rule.each( ( node ) => {
		if ( node.type === 'decl' && /^background(-color)?$/.test( node.prop ) ) {
			const match = node.value.match( /var\(\s*(--[\w-]+)\s*\)/ );
			if ( match ) {
				token = match[ 1 ];
			}
		}
	} );
	if ( ! token ) {
		throw new Error( `No background custom property found for ${ label }` );
	}
	return token;
};

const legendOptionRule = directRule( chartStyleRoot, '.chart__legend-option' );
const legendColorRule = directRule( legendOptionRule, '.chart__legend-color' );
const legendSecondaryRule = directRule( legendColorRule, '&.is-secondary' );

const SERIES = {
	viewsBar: backgroundToken( directRule( chartStyleRoot, '.chart__bar-section' ), 'views bar' ),
	visitorsBar: backgroundToken(
		directRule( chartStyleRoot, '.chart__bar-section-inner' ),
		'visitors bar'
	),
	viewsSwatch: backgroundToken( legendColorRule, 'views legend swatch' ),
	visitorsSwatch: backgroundToken( legendSecondaryRule, 'visitors legend swatch' ),
};

type SeriesPair = { views: string; visitors: string };

const parseSeriesRules = ( root: postcss.Root ) => {
	let base: SeriesPair | null = null;
	const overrides = new Map< string, SeriesPair >();
	root.each( ( node ) => {
		if ( node.type !== 'rule' ) {
			return;
		}
		const values: Partial< Record< 'views' | 'visitors', string > > = {};
		node.each( ( child ) => {
			if ( child.type !== 'decl' ) {
				return;
			}
			const match = child.prop.match( /^--chart-series-(views|visitors)$/ );
			if ( match ) {
				values[ match[ 1 ] as 'views' | 'visitors' ] = child.value.trim();
			}
		} );
		if ( ! values.views && ! values.visitors ) {
			return;
		}
		if ( ! values.views || ! values.visitors ) {
			throw new Error( `Incomplete chart-series rule in chart/style.scss: ${ node.selector }` );
		}
		const pair: SeriesPair = { views: values.views, visitors: values.visitors };
		for ( const selector of node.selectors ) {
			if ( selector === ':root' ) {
				base = pair;
				continue;
			}
			const schemeMatch = selector.match( /^\.color-scheme\.is-([\w-]+)$/ );
			if ( schemeMatch ) {
				overrides.set( schemeMatch[ 1 ], pair );
			}
		}
	} );
	if ( ! base ) {
		throw new Error( 'No :root base chart-series rule found in chart/style.scss' );
	}
	return { base, overrides };
};

const { base: baseSeriesPair, overrides: seriesOverrides } = parseSeriesRules( chartStyleRoot );

const pairForScheme = ( scheme: string ): SeriesPair =>
	seriesOverrides.get( scheme ) ?? baseSeriesPair;

const seriesHex = ( scheme: string, series: 'views' | 'visitors' ) => {
	const value = pairForScheme( scheme )[ series ];
	const resolved = resolve( value, scheme );
	if ( ! resolved ) {
		throw new Error(
			`Could not resolve --chart-series-${ series } (${ value }) for scheme ${ scheme }`
		);
	}
	return resolved;
};

const schemeNames = [ ...schemes.keys() ];

const VISITORS_100_ALLOWED_SCHEMES = [ 'contrast' ];

const lineChartSource = fs.readFileSync( LINE_CHART, 'utf8' );
const LINE_CHART_TOKENS = [ ...lineChartSource.matchAll( /useCssVariable\(\s*'(--[\w-]+)'/g ) ].map(
	( m ) => m[ 1 ]
);
const [ LINE_CHART_VIEWS_TOKEN, LINE_CHART_VISITORS_TOKEN ] = LINE_CHART_TOKENS;

describe( 'Stats chart series colours meet WCAG 1.4.11', () => {
	it( 'bar chart series read the shared --chart-series custom properties', () => {
		expect( SERIES.viewsBar ).toBe( '--chart-series-views' );
		expect( SERIES.visitorsBar ).toBe( '--chart-series-visitors' );
	} );

	it.each( schemeNames )(
		'bar chart: has an explicit .color-scheme.is-%s rule declaring --chart-series-views and --chart-series-visitors',
		( scheme ) => {
			if ( ! seriesOverrides.has( scheme ) ) {
				throw new Error(
					`.color-scheme.is-${ scheme } has no explicit --chart-series-views/--chart-series-visitors rule in chart/style.scss. ` +
						'A scheme cannot rely on the :root fallback: CSS substitutes var() at the element where a custom ' +
						'property is declared, not where it is used, so --chart-series-views declared on :root resolves ' +
						"--color-accent-40 against :root (the default scheme's ramp), not against this scheme's ramp. " +
						`Add an explicit .color-scheme.is-${ scheme } rule with both declarations.`
				);
			}
			expect( seriesOverrides.has( scheme ) ).toBe( true );
		}
	);

	it.each( schemeNames )(
		'bar chart: Views and Visitors meet the 3:1 pair-contrast rule against each other in the %s scheme',
		( scheme ) => {
			const views = seriesHex( scheme, 'views' );
			const visitors = seriesHex( scheme, 'visitors' );

			expect( contrast( views, visitors ) ).toBeGreaterThanOrEqual( MIN_RATIO );
		}
	);

	it.each( schemeNames )(
		'bar chart: Visitors meets the 3:1 contrast rule against the surface in the %s scheme',
		( scheme ) => {
			const surface = tokenValue( scheme, '--color-surface' );
			const visitors = seriesHex( scheme, 'visitors' );

			expect( contrast( visitors, surface ) ).toBeGreaterThanOrEqual( MIN_RATIO );
		}
	);

	it.each( schemeNames )(
		'bar chart: Views meets the 3:1 contrast rule against the surface in the %s scheme',
		( scheme ) => {
			const surface = tokenValue( scheme, '--color-surface' );
			const views = seriesHex( scheme, 'views' );

			expect( contrast( views, surface ) ).toBeGreaterThanOrEqual( MIN_RATIO );
		}
	);

	it.each( schemeNames.filter( ( scheme ) => ! VISITORS_100_ALLOWED_SCHEMES.includes( scheme ) ) )(
		'bar chart: Visitors does not resolve to --color-accent-100 in the %s scheme',
		( scheme ) => {
			const visitors = pairForScheme( scheme ).visitors;

			expect( visitors ).not.toBe( 'var(--color-accent-100)' );
		}
	);

	it( 'bar chart: legend swatches use the same tokens as the bars they label', () => {
		expect( SERIES.viewsSwatch ).toBe( SERIES.viewsBar );
		expect( SERIES.visitorsSwatch ).toBe( SERIES.visitorsBar );
	} );

	it( 'line chart reads the same --chart-series-views and --chart-series-visitors tokens as the bar chart, keeping the shared legend correct', () => {
		expect( LINE_CHART_TOKENS ).toHaveLength( 2 );
		expect( LINE_CHART_VIEWS_TOKEN ).toBe( SERIES.viewsBar );
		expect( LINE_CHART_VISITORS_TOKEN ).toBe( SERIES.visitorsBar );
	} );

	it( 'Odyssey widget mini-chart does not override the shared series colours', () => {
		const source = fs.readFileSync( WIDGET_CHART, 'utf8' );
		expect( source ).not.toMatch( /--color-primary/ );
		expect( source ).not.toMatch( /\.chart__bar-section-inner\s*\{/ );
		expect( source ).not.toMatch( /&\.is-secondary\s*\{/ );
	} );
} );
