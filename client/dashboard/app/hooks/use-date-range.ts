import { useRouter, useSearch } from '@tanstack/react-router';
import { getUnixTime, fromUnixTime, isValid as isValidDate, subDays, isSameSecond } from 'date-fns';
import { useState, useRef, useEffect, useCallback } from 'react';
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
}

export function useDateRange( {
	timezoneString,
	gmtOffset,
	autoRefresh = false,
	defaultDays = 7,
	initializeUrl = false,
}: UseDateRangeOptions ) {
	const router = useRouter();
	const search = useSearch( { strict: false } );

	const initial = getDefaultDateRange( timezoneString, gmtOffset, defaultDays );
	const initialFromUrl = getInitialDateRangeFromSearch( search );

	const [ dateRange, setDateRange ] = useState< { start: Date; end: Date } >(
		() => initialFromUrl ?? initial
	);

	const initializedUrl = useRef( false );

	const syncUrl = useCallback(
		( from: number, to: number ) => {
			const current = router.latestLocation.search;
			if ( current.from === from && current.to === to ) {
				return;
			}
			return router.navigate< AnyRouter, string >( {
				// Match search can lag behind a pending view navigation.
				search: () => ( { ...router.latestLocation.search, from, to } ),
				replace: true,
				resetScroll: false,
			} );
		},
		[ router ]
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

	const handleDateRangeChange = async ( next: { start: Date; end: Date } ) => {
		const pathname = router.latestLocation.pathname;

		// Sync from/to to the URL as UNIX seconds
		const { startSec, endSec } = buildTimeRangeInSeconds(
			next.start,
			next.end,
			timezoneString,
			gmtOffset
		);

		await syncUrl( startSec, endSec );
		const current = router.latestLocation;
		if (
			current.pathname !== pathname ||
			current.search.from !== startSec ||
			current.search.to !== endSec
		) {
			return false;
		}
		setDateRange( next );
		return true;
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
			const start = subDays( end, defaultDays - 1 );

			setDateRange( ( prev ) =>
				isSameSecond( prev.start, start ) && isSameSecond( prev.end, end ) ? prev : { start, end }
			);

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
