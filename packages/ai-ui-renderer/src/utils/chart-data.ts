import { formatNumber } from '@automattic/number-formatters';

export interface Series< Point > {
	label: string;
	data: Point[];
}

export interface ChartTable {
	headings: string[];
	rows: string[][];
}

export const getLabel = ( { label }: { label: string } ) => label;

export const formatChartNumber = ( value: number ) =>
	formatNumber( value, { numberFormatOptions: { maximumFractionDigits: 6 } } );

// Dates follow the page's language, not the browser's, unless it isn't a valid locale, such as
// `de_formal`.
export function getPageLocale() {
	try {
		return Intl.getCanonicalLocales( document.documentElement.lang )[ 0 ];
	} catch {
		return undefined;
	}
}

export function formatDate( date: Date ) {
	return date.toLocaleDateString( getPageLocale(), { dateStyle: 'medium' } );
}

// The library shows bad data as an English error or draws it wrong, so a chart throws instead, and
// the surface shows its fallback and reports the error.
function assertUnique( values: string[], name: string ) {
	const duplicate = values.find( ( value, index ) => values.indexOf( value ) !== index );

	if ( duplicate !== undefined ) {
		throw new Error( `A chart repeats the ${ name } “${ duplicate }”.` );
	}
}

export function assertUniqueSeries< Point >(
	series: Series< Point >[],
	getKey: ( point: Point ) => string
) {
	assertUnique( series.map( getLabel ), 'series' );
	series.forEach( ( { data } ) => assertUnique( data.map( getKey ), 'point' ) );
}

// Each series' points by key, such as a date or a category.
export function indexSeries< Point >(
	series: Series< Point >[],
	getKey: ( point: Point ) => string
) {
	return series.map( ( { label, data } ) => ( {
		label,
		points: new Map( data.map( ( point ) => [ getKey( point ), point ] as const ) ),
	} ) );
}

// A row per key, with each series' value.
export function getChartTable< Point extends { value: number } >(
	keyHeading: string,
	series: Series< Point >[],
	getKey: ( point: Point ) => string
): ChartTable {
	const indexedSeries = indexSeries( series, getKey );
	const keys = [ ...new Set( indexedSeries.flatMap( ( { points } ) => [ ...points.keys() ] ) ) ];

	return {
		headings: [ keyHeading, ...series.map( getLabel ) ],
		rows: keys.map( ( key ) => [
			key,
			...indexedSeries.map( ( { points } ) => {
				const point = points.get( key );

				return point ? formatChartNumber( point.value ) : '';
			} ),
		] ),
	};
}
