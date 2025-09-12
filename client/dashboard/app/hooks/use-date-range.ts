import { useRouter } from '@tanstack/react-router';
import { getUnixTime, fromUnixTime, isValid as isValidDate } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { formatYmd, parseYmdLocal } from '../../utils/datetime';

interface UseDateRangeOptions {
	timezoneString?: string;
	gmtOffset?: number;
	autoRefresh?: boolean;
}

export function useDateRange( {
	timezoneString,
	gmtOffset,
	autoRefresh = false,
}: UseDateRangeOptions ) {
	const router = useRouter();
	const search = router.state.location.search;

	const initial = getDefaultDateRange( timezoneString, gmtOffset );
	const initialFromUrl = getInitialDateRangeFromSearch( search );

	const [ dateRange, setDateRange ] = useState< { start: Date; end: Date } >(
		() => initialFromUrl ?? initial
	);

	const lastUrlRangeRef = useRef< { from: number; to: number } | null >( null );

	const handleDateRangeChange = ( next: { start: Date; end: Date } ) => {
		setDateRange( next );

		// Sync from/to to the URL as UNIX seconds
		const url = new URL( window.location.href );
		url.searchParams.set( 'from', String( getUnixTime( next.start ) ) );
		url.searchParams.set( 'to', String( getUnixTime( next.end ) ) );
		window.history.replaceState( null, '', url.pathname + url.search );
	};

	// Auto-refresh effect for live updating
	useEffect( () => {
		if ( ! autoRefresh ) {
			return;
		}

		const tick = () => {
			const newDefault = getDefaultDateRange( timezoneString, gmtOffset );

			setDateRange( ( prev ) => {
				// Only update if dates actually changed to avoid unnecessary re-renders
				const isSame =
					prev.start.getTime() === newDefault.start.getTime() &&
					prev.end.getTime() === newDefault.end.getTime();
				return isSame ? prev : newDefault;
			} );

			const from = getUnixTime( newDefault.start );
			const to = getUnixTime( newDefault.end );

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
	}, [ autoRefresh, timezoneString, gmtOffset ] );

	return {
		dateRange,
		handleDateRangeChange,
	};
}

/**
 * Get the default date range (7 days ending today).
 */
export function getDefaultDateRange( timezoneString?: string, gmtOffset?: number ) {
	const siteToday = parseYmdLocal( formatYmd( new Date(), timezoneString, gmtOffset ) )!;
	return {
		start: new Date( siteToday.getFullYear(), siteToday.getMonth(), siteToday.getDate() - 6 ),
		end: siteToday,
	};
}

/**
 * Get the initial date range from the URL search parameters.
 */
export function getInitialDateRangeFromSearch( search: string ): { start: Date; end: Date } | null {
	const params = new URLSearchParams( search );
	const valueAsNumber = ( value?: string | null ) => ( value ? Number( value ) : NaN );
	const toDate = ( dateString?: string | null ) => {
		const num = valueAsNumber( dateString );
		if ( ! Number.isFinite( num ) ) {
			return undefined;
		}
		const date = fromUnixTime( num );
		return isValidDate( date ) ? date : undefined;
	};

	const start = toDate( params.get( 'from' ) );
	const end = toDate( params.get( 'to' ) );
	return start && end && start <= end ? { start, end } : null;
}
