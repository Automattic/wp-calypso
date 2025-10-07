/**
 * Shared utilities for chart components
 */
import type { SeriesData } from '@automattic/charts';

/**
 * Calculate bottom margin for charts based on data and display requirements
 * @param minMargin   - Minimum margin to apply
 * @param charWidth   - Average character width for calculations
 * @param padding     - Additional padding
 * @param labelLength - Optional label length for custom calculations
 * @return Calculated bottom margin
 */
export const calculateBottomMargin = (
	minMargin: number = 80,
	charWidth: number = 6,
	padding: number = 25,
	labelLength?: number
): number => {
	const calculatedLength = labelLength ?? 5;
	return Math.max( minMargin, calculatedLength * charWidth + padding );
};

/**
 * Parse date value to Date object, handling timezone correctly for YYYY-MM-DD format
 * @param dateValue - Date value to parse (Date object or string)
 * @return Parsed Date object or null if invalid
 */
const parseDate = ( dateValue: Date | string ): Date | null => {
	if ( dateValue instanceof Date ) {
		return dateValue;
	}

	const dateStr = String( dateValue );
	if ( dateStr.includes( 'T' ) || dateStr.includes( ' ' ) ) {
		return new Date( dateStr );
	}

	// For YYYY-MM-DD format, parse as local date to avoid timezone shifts
	const [ year, month, day ] = dateStr.split( '-' ).map( Number );
	return new Date( year, month - 1, day );
};

/**
 * Generate time axis configuration for charts with date data
 * @param data - Chart series data
 * @return Axis configuration object
 */
export const getTimeAxisConfig = ( data: SeriesData[] ) => {
	// Collect all date points from all series
	const allDataPoints: any[] = [];
	data?.forEach( ( series ) => {
		if ( series?.data ) {
			allDataPoints.push( ...series.data );
		}
	} );

	if ( allDataPoints.length === 0 ) {
		return {};
	}

	// Extract and sort all unique dates
	const allDates = allDataPoints
		.map( ( point ) => {
			if ( point && 'date' in point && point.date ) {
				return parseDate( point.date );
			}
			if ( point && 'dateString' in point && point.dateString ) {
				return parseDate( point.dateString );
			}
			return null;
		} )
		.filter(
			( date ): date is Date => date !== null && ! isNaN( date.getTime() )
		)
		.sort( ( a, b ) => a.getTime() - b.getTime() );

	// Remove duplicate
	const uniqueDates = Array.from(
		new Set( allDates.map( ( d ) => d.getTime() ) )
	).map( ( timestamp ) => new Date( timestamp ) );

	if ( uniqueDates.length === 0 ) {
		return {};
	}

	// Select tick values from the complete date range
	const indices = [
		0,
		Math.floor( uniqueDates.length / 3 ),
		Math.floor( ( 2 * uniqueDates.length ) / 3 ),
		uniqueDates.length - 1,
	];

	const tickValues = indices
		.map( ( i ) => uniqueDates[ i ] )
		.filter(
			( date ): date is Date => date !== null && ! isNaN( date.getTime() )
		);

	return {
		orientation: 'bottom' as const,
		tickValues,
		tickFormat: ( value: Date | string | number ) => {
			let date: Date | null = null;

			if ( value instanceof Date ) {
				date = value;
			} else if ( typeof value === 'string' ) {
				const parsed = new Date( value );
				if ( ! isNaN( parsed.getTime() ) ) {
					date = parsed;
				}
			}

			if ( date ) {
				return `${ ( date.getMonth() + 1 )
					.toString()
					.padStart( 2, '0' ) }/${ date
					.getDate()
					.toString()
					.padStart( 2, '0' ) }`;
			}

			return String( value || '' );
		},
		tickLabelProps: () => ( {
			fontSize: 11,
			textAnchor: 'end' as const,
			angle: -90,
			dx: 0,
			dy: -5,
		} ),
	};
};

/**
 * Generate default chart margins with calculated bottom margin
 * @param customMargin        - Optional custom margin overrides
 * @param customMargin.top    - Top margin override
 * @param customMargin.right  - Right margin override
 * @param customMargin.bottom - Bottom margin override
 * @param customMargin.left   - Left margin override
 * @return Complete margin configuration
 */
export const getDefaultChartMargins = ( customMargin?: {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
} ) => {
	const defaultMargin = {
		top: 15,
		right: 20,
		bottom: 100,
		left: 50,
	};

	return {
		...defaultMargin,
		...customMargin,
		bottom: calculateBottomMargin( 120 ),
	};
};
