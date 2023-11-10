import page from '@automattic/calypso-router';
import type { Moment } from 'moment';

export type SiteMonitoringTab = 'metrics' | 'php' | 'web';

export function getPageQueryParam(): SiteMonitoringTab | null {
	const param = new URL( window.location.href ).searchParams.get( 'page' );
	return param && [ 'metrics', 'php', 'web' ].includes( param )
		? ( param as SiteMonitoringTab )
		: null;
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

export function getSeverityQueryParam(): string {
	const { searchParams } = new URL( window.location.href );
	return searchParams.get( 'severity' ) || '';
}

export function updateSeverityQueryParam( severity: string | null ) {
	const url = new URL( window.location.href );

	if ( severity ) {
		if ( ! severity ) {
			return;
		}

		url.searchParams.set( 'severity', severity );
	} else {
		url.searchParams.delete( 'severity' );
	}

	page.replace( url.pathname + url.search );
}

export function getRequestTypeQueryParam(): string {
	const { searchParams } = new URL( window.location.href );
	return searchParams.get( 'requestType' ) || '';
}

export function updateRequestTypeQueryParam( requestType: string | null ) {
	const url = new URL( window.location.href );

	if ( requestType ) {
		if ( ! requestType ) {
			return;
		}

		url.searchParams.set( 'requestType', requestType );
	} else {
		url.searchParams.delete( 'requestType' );
	}

	page.replace( url.pathname + url.search );
}
