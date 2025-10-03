import type { TimeframeOption } from '../types';

/**
 * Get available timeframes for report building
 */
export const getAvailableTimeframes = (
	translate: ( key: string, args?: Record< string, unknown > ) => string
): TimeframeOption[] => [
	{ label: translate( 'Last 30 days' ), value: '30_days' },
	{ label: translate( 'Last 7 days' ), value: '7_days' },
	{ label: translate( 'Last 24 hours' ), value: '24_hours' },
	{ label: translate( 'Custom range' ), value: 'custom' },
];

/**
 * Get display text for a specific timeframe value
 */
export const getTimeframeText = (
	timeframe: string,
	translate: ( key: string, args?: Record< string, unknown > ) => string
): string => {
	const availableTimeframes = getAvailableTimeframes( translate );
	const matchingTimeframe = availableTimeframes.find( ( option ) => option.value === timeframe );
	return matchingTimeframe?.label || timeframe;
};
