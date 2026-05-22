import { __ } from '@wordpress/i18n';
import { useCallback, useState } from 'react';

export type Timeframe = 'last-15-min' | 'last-hour' | 'last-6-hours' | 'last-24-hours';

export const TIMEFRAME_SECONDS: Record< Timeframe, number > = {
	'last-15-min': 15 * 60,
	'last-hour': 60 * 60,
	'last-6-hours': 6 * 60 * 60,
	'last-24-hours': 24 * 60 * 60,
};

export const DEFAULT_TIMEFRAME: Timeframe = 'last-hour';

export const TIMEFRAME_OPTIONS: Array< { value: Timeframe; label: string } > = [
	{ value: 'last-15-min', label: __( 'Last 15 minutes' ) },
	{ value: 'last-hour', label: __( 'Last hour' ) },
	{ value: 'last-6-hours', label: __( 'Last 6 hours' ) },
	{ value: 'last-24-hours', label: __( 'Last 24 hours' ) },
];

// Lower-case timeframe labels for use mid-sentence (e.g. "No data in the last hour").
// Translated separately so locales that handle casing differently can override.
export function getLowercaseTimeframeLabel( timeframe: Timeframe ): string {
	switch ( timeframe ) {
		case 'last-15-min':
			return __( 'last 15 minutes' );
		case 'last-hour':
			return __( 'last hour' );
		case 'last-6-hours':
			return __( 'last 6 hours' );
		case 'last-24-hours':
			return __( 'last 24 hours' );
	}
}

const TIMEFRAME_STORAGE_KEY = 'dashboard-apm-backend-timeframe';

const VALID_TIMEFRAMES = new Set< string >( Object.keys( TIMEFRAME_SECONDS ) );

function isTimeframe( value: string | null | undefined ): value is Timeframe {
	return !! value && VALID_TIMEFRAMES.has( value );
}

function canUseLocalStorage(): boolean {
	return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getStoredOrDefaultTimeframe(): Timeframe {
	return readStoredTimeframe() ?? DEFAULT_TIMEFRAME;
}

function readStoredTimeframe(): Timeframe | null {
	if ( ! canUseLocalStorage() ) {
		return null;
	}
	try {
		const value = window.localStorage.getItem( TIMEFRAME_STORAGE_KEY );
		return isTimeframe( value ) ? value : null;
	} catch {
		return null;
	}
}

function writeStoredTimeframe( timeframe: Timeframe ): void {
	if ( ! canUseLocalStorage() ) {
		return;
	}
	try {
		window.localStorage.setItem( TIMEFRAME_STORAGE_KEY, timeframe );
	} catch {
		// Ignore — quota exceeded or storage disabled.
	}
}

// Whether the timeframe's end is "now" (a rolling window) vs. a fixed
// historical range. Today only rolling presets are exposed; the switch keeps
// the API exhaustive so a future custom-range variant has to opt in.
export function isRollingTimeframe( timeframe: Timeframe ): boolean {
	switch ( timeframe ) {
		case 'last-15-min':
		case 'last-hour':
		case 'last-6-hours':
		case 'last-24-hours':
			return true;
	}
}

/**
 * Returns the current timeframe selection backed by localStorage. The setter
 * writes through to storage so the choice survives reloads.
 */
export function usePersistedTimeframe(): [ Timeframe, ( next: Timeframe ) => void ] {
	const [ value, setValue ] = useState< Timeframe >(
		() => readStoredTimeframe() ?? DEFAULT_TIMEFRAME
	);
	const setAndPersist = useCallback( ( next: Timeframe ) => {
		setValue( next );
		writeStoredTimeframe( next );
	}, [] );
	return [ value, setAndPersist ];
}
