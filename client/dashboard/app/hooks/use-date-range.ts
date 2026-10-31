import { TZDate } from '@date-fns/tz';
import { useRouter, useSearch } from '@tanstack/react-router';
import { getUnixTime, fromUnixTime, isValid as isValidDate, subDays } from 'date-fns';
import { useMemo, useRef, useEffect, useCallback } from 'react';
import { buildTimeRangeInSeconds } from '../../sites/logs/utils';
import { formatYmd, parseYmdLocal } from '../../utils/datetime';
import type { DateRangeSearch } from '../../utils/date-range-search';
import type { AnyRouter } from '@tanstack/react-router';

interface UseDateRangeOptions {
	timezoneString?: string;
	gmtOffset?: number;
	autoRefresh?: boolean;
	defaultDays?: number;
	initializeUrl?: boolean;
	resetPageOnChange?: boolean;
	selectionPath?: string;
}

export function useDateRange( {
	timezoneString,
	gmtOffset,
	autoRefresh = false,
	defaultDays = 7,
	initializeUrl = false,
	resetPageOnChange = false,
	selectionPath,
}: UseDateRangeOptions ) {
	const router = useRouter();
	const search = useSearch( { strict: false } );
	const { from, to } = search;

	const dateRange = useMemo( () => {
		const range = getInitialDateRangeFromSearch( { from, to } );
		if ( ! range ) {
			return getDefaultDateRange( timezoneString, gmtOffset, defaultDays );
		}
		// URL bounds are instants; the picker expects local Dates carrying site calendar days.
		const start = parseYmdLocal( formatYmd( range.start, timezoneString, gmtOffset ) );
		const end = parseYmdLocal( formatYmd( range.end, timezoneString, gmtOffset ) );
		return start && end
			? { start, end }
			: getDefaultDateRange( timezoneString, gmtOffset, defaultDays );
	}, [ from, to, timezoneString, gmtOffset, defaultDays ] );

	const initializedUrl = useRef( false );

	const syncUrl = useCallback(
		( from: number, to: number, selection = false ) => {
			const current = router.latestLocation.search;
			if (
				current.from === from &&
				current.to === to &&
				( ! selection || ! resetPageOnChange || current.page === undefined ) &&
				( ! selection || ! selectionPath || router.latestLocation.pathname === selectionPath )
			) {
				return;
			}
			return router.navigate< AnyRouter, string >( {
				...( selection && selectionPath ? { to: selectionPath } : {} ),
				search: () => ( {
					...router.latestLocation.search,
					from,
					to,
					...( selection && resetPageOnChange ? { page: undefined } : {} ),
				} ),
				replace: true,
				resetScroll: false,
			} );
		},
		[ router, resetPageOnChange, selectionPath ]
	);

	// PHP/server logs have always pinned their default range in the URL.
	useEffect( () => {
		if ( ! initializeUrl || initializedUrl.current ) {
			return;
		}
		initializedUrl.current = true;
		// Use validated bounds so restored URLs also canonicalize legacy or invalid values.
		if ( search.from !== undefined && search.to !== undefined ) {
			void syncUrl( search.from, search.to );
			return;
		}
		const { startSec, endSec } = buildTimeRangeInSeconds(
			dateRange.start,
			dateRange.end,
			timezoneString,
			gmtOffset
		);
		void syncUrl( startSec, endSec );
	}, [ initializeUrl, search, dateRange, timezoneString, gmtOffset, syncUrl ] );

	const handleDateRangeChange = ( next: { start: Date; end: Date } ) => {
		const { startSec, endSec } = buildTimeRangeInSeconds(
			next.start,
			next.end,
			timezoneString,
			gmtOffset
		);
		void syncUrl( startSec, endSec, true );
	};

	// Auto-refresh effect for live updating
	useEffect( () => {
		if ( ! autoRefresh ) {
			return;
		}

		const pathname = router.latestLocation.pathname;
		const tick = () => {
			if ( router.latestLocation.pathname !== pathname ) {
				return;
			}
			const end = new Date();
			// Preserve the site clock across its DST changes, independently of browser DST.
			let start: Date;
			if ( timezoneString ) {
				start = subDays( new TZDate( end, timezoneString ), defaultDays - 1 );
			} else if ( typeof gmtOffset === 'number' ) {
				start = new Date( end.getTime() - ( defaultDays - 1 ) * 86_400_000 );
			} else {
				start = subDays( end, defaultDays - 1 );
			}

			const from = getUnixTime( start );
			const to = getUnixTime( end );

			void syncUrl( from, to );
		};

		// Run immediately, then every 10s
		tick();
		const intervalId = setInterval( tick, 10 * 1000 );
		return () => clearInterval( intervalId );
	}, [ autoRefresh, defaultDays, timezoneString, gmtOffset, router, syncUrl ] );

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
 * Get the initial date range from the URL search parameters.
 */
export function getInitialDateRangeFromSearch( {
	from,
	to,
}: DateRangeSearch ): { start: Date; end: Date } | null {
	const toDate = ( seconds?: number ) => {
		if ( seconds === undefined ) {
			return undefined;
		}
		const date = fromUnixTime( seconds );
		return isValidDate( date ) ? date : undefined;
	};

	const start = toDate( from );
	const end = toDate( to );
	return start && end && start <= end ? { start, end } : null;
}
