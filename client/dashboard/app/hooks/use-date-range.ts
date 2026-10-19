import { useRouter } from '@tanstack/react-router';
import { getUnixTime, fromUnixTime, isValid as isValidDate, subDays, isSameSecond } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { buildTimeRangeInSeconds } from '../../sites/logs/utils';
import { formatYmd, parseYmdLocal } from '../../utils/datetime';

interface UseDateRangeOptions {
	timezoneString?: string;
	gmtOffset?: number;
	autoRefresh?: boolean;
	defaultDays?: number;
}

export function useDateRange( {
	timezoneString,
	gmtOffset,
	autoRefresh = false,
	defaultDays = 7,
}: UseDateRangeOptions ) {
	const router = useRouter();
	const search = router.state.location.search;

	const initial = getDefaultDateRange( timezoneString, gmtOffset, defaultDays );
	const initialFromUrl = getInitialDateRangeFromSearch( search );

	const [ dateRange, setDateRange ] = useState< { start: Date; end: Date } >(
		() => initialFromUrl ?? initial
	);

	const lastUrlRangeRef = useRef< { from: number; to: number } | null >( null );

	// Rewrite millisecond from/to params (older shared links) to canonical Unix seconds.
	// Go through the router so this composes with navigations queued by child views on mount.
	useEffect( () => {
		const toSeconds = ( value: unknown ) => {
			const seconds = parseUnixSecondsParam( value == null ? null : String( value ) );
			return seconds ?? value;
		};
		const { from, to } = router.state.location.search as Record< string, unknown >;
		if ( toSeconds( from ) === from && toSeconds( to ) === to ) {
			return;
		}
		router.navigate( {
			to: '.',
			search: ( prev: Record< string, unknown > ) => ( {
				...prev,
				from: toSeconds( prev.from ),
				to: toSeconds( prev.to ),
			} ),
			replace: true,
			resetScroll: false,
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps -- normalize once on mount
	}, [] );

	const handleDateRangeChange = ( next: { start: Date; end: Date } ) => {
		setDateRange( next );

		// Sync from/to to the URL as UNIX seconds
		const url = new URL( window.location.href );
		const { startSec, endSec } = buildTimeRangeInSeconds(
			next.start,
			next.end,
			timezoneString,
			gmtOffset
		);

		url.searchParams.set( 'from', String( startSec ) );
		url.searchParams.set( 'to', String( endSec ) );
		window.history.replaceState( null, '', url.pathname + url.search );
	};

	// Auto-refresh effect for live updating
	useEffect( () => {
		if ( ! autoRefresh ) {
			return;
		}

		const tick = () => {
			const end = new Date();
			const start = subDays( end, defaultDays - 1 );

			setDateRange( ( prev ) =>
				isSameSecond( prev.start, start ) && isSameSecond( prev.end, end ) ? prev : { start, end }
			);

			const from = getUnixTime( start );
			const to = getUnixTime( end );

			const last = lastUrlRangeRef.current;
			// Only sync URL when from/to change to avoid unnecessary history updates
			if ( ! last || last.from !== from || last.to !== to ) {
				const url = new URL( window.location.href );
				url.searchParams.set( 'from', String( from ) );
				url.searchParams.set( 'to', String( to ) );
				window.history.replaceState( null, '', url.pathname + url.search );
				lastUrlRangeRef.current = { from, to };
			}
		};

		// Run immediately, then every 10s
		tick();
		const intervalId = setInterval( tick, 10 * 1000 );
		return () => clearInterval( intervalId );
	}, [ autoRefresh, defaultDays, timezoneString, gmtOffset ] );

	return {
		dateRange,
		handleDateRangeChange,
	};
}

/**
 * Get the default date range ending today.
 */
export function getDefaultDateRange(
	timezoneString?: string,
	gmtOffset?: number,
	defaultDays: number = 7
) {
	const siteToday = parseYmdLocal( formatYmd( new Date(), timezoneString, gmtOffset ) )!;
	return {
		start: new Date(
			siteToday.getFullYear(),
			siteToday.getMonth(),
			siteToday.getDate() - ( defaultDays - 1 )
		),
		end: siteToday,
	};
}

/**
 * Parse a `from`/`to` URL param as Unix seconds. Values of 1e12 and above are treated as
 * milliseconds, which older versions of the logs page used in shared links.
 */
export function parseUnixSecondsParam( raw?: string | null ): number | null {
	if ( ! raw ) {
		return null;
	}
	const num = Number.parseInt( raw, 10 );
	if ( ! Number.isFinite( num ) ) {
		return null;
	}
	return num >= 1e12 ? Math.floor( num / 1000 ) : num;
}

/**
 * Get the initial date range from the URL search parameters.
 */
export function getInitialDateRangeFromSearch( search: string ): { start: Date; end: Date } | null {
	const params = new URLSearchParams( search );
	const toDate = ( raw: string | null ) => {
		const num = parseUnixSecondsParam( raw );
		if ( num === null ) {
			return undefined;
		}
		const date = fromUnixTime( num );
		return isValidDate( date ) ? date : undefined;
	};

	const start = toDate( params.get( 'from' ) );
	const end = toDate( params.get( 'to' ) );
	return start && end && start <= end ? { start, end } : null;
}
