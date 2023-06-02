import page from 'page';
import type { SiteLogsTab } from 'calypso/data/hosting/use-site-logs-query';
import type { Moment } from 'moment';

export function getLogTypeQueryParam(): SiteLogsTab | null {
	const logTypeParam = new URL( window.location.href ).searchParams.get( 'log-type' );
	return logTypeParam && [ 'php', 'web' ].includes( logTypeParam )
		? ( logTypeParam as SiteLogsTab )
		: null;
}

export function updateLogTypeQueryParam( tabName: SiteLogsTab ) {
	const url = new URL( window.location.href );
	url.searchParams.set( 'log-type', tabName );
	page.replace( url.pathname + url.search );
}

export function getDateRangeQueryParam( moment: typeof import('moment') ): {
	startTime: Moment | null;
	endTime: Moment | null;
} {
	const { searchParams } = new URL( window.location.href );
	const from = parseInt( searchParams.get( 'from' ) || '', 10 );
	const to = parseInt( searchParams.get( 'to' ) || '', 10 );

	return {
		startTime: isNaN( from ) ? null : moment.unix( from ),
		endTime: isNaN( to ) ? null : moment.unix( to ),
	};
}

export function updateDateRangeQueryParam(
	dateRange: { startTime: Moment; endTime: Moment } | null
) {
	const url = new URL( window.location.href );

	if ( dateRange ) {
		const { startTime, endTime } = dateRange;
		if ( ! startTime.isValid() || ! endTime.isValid() || startTime.isAfter( endTime ) ) {
			// Don't save invalid date ranges
			return;
		}

		url.searchParams.set( 'from', startTime.unix().toString( 10 ) );
		url.searchParams.set( 'to', endTime.unix().toString( 10 ) );
	} else {
		url.searchParams.delete( 'from' );
		url.searchParams.delete( 'to' );
	}

	page.replace( url.pathname + url.search );
}
