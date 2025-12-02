import type { TimeRange } from './types';

export function convertTimeRangeToUnix( timeRange: number ): TimeRange {
	const start = Math.floor( new Date().getTime() / 1000 ) - timeRange * 3600;
	const end = Math.floor( new Date().getTime() / 1000 );

	return { start, end };
}

export const chartColors = [ '#3858E9', '#5BA300', '#F57600', '#B51963' ];

export function getLineChartTickNumber(
	timeRange: number,
	lessThanMediumViewport: boolean
): number | undefined {
	let numTicks: undefined | number;
	switch ( timeRange ) {
		case 168:
			numTicks = lessThanMediumViewport ? 3 : 7;
			break;
		case 72:
			numTicks = lessThanMediumViewport ? 3 : 6;
			break;
		case 24:
		case 6:
			numTicks = lessThanMediumViewport ? 4 : 12;
			break;
	}

	return numTicks;
}

export function getLineChartTickLabel(
	date: string,
	timeRange: number,
	lessThanMediumViewport: boolean
): string {
	const d = new Date( date );

	if ( timeRange <= 24 ) {
		return `${ d.getHours() }:${ d.getMinutes().toString().padStart( 2, '0' ) }`;
	}

	if ( timeRange > 72 || ( timeRange > 24 && lessThanMediumViewport ) ) {
		return `${ d.toLocaleDateString() }`;
	}

	return `${ d.toLocaleDateString() } ${ d.getHours() }:${ d
		.getMinutes()
		.toString()
		.padStart( 2, '0' ) }`;
}
