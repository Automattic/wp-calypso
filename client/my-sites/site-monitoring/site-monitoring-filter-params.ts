import page from '@automattic/calypso-router';
import type { Moment } from 'moment';

export type SiteMonitoringTab = 'metrics' | 'php' | 'web';

interface SiteMonitoringTabParamsType {
	[ key: string ]: string[];
}

const SiteMonitoringTabParams: SiteMonitoringTabParamsType = {
	metrics: [],
	php: [ 'from', 'to', 'severity' ],
	web: [ 'from', 'to', 'request_type', 'request_status' ],
};

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

export function getFilterQueryParam( filter: string ): string {
	const { searchParams } = new URL( window.location.href );
	return searchParams.get( filter ) || '';
}

export function updateFilterQueryParam( filter: string, value: string | null ) {
	const url = new URL( window.location.href );

	if ( value ) {
		url.searchParams.set( filter, value );
	} else {
		url.searchParams.delete( filter );
	}

	page.replace( url.pathname + url.search );
}

export function getQuerySearchForTab( tabName: string ): string {
	if ( ! SiteMonitoringTabParams[ tabName ].length ) {
		return '';
	}

	const url = new URL( window.location.href );

	const keysToDelete = [];

	url.searchParams.forEach( ( value, key ) => {
		if ( ! SiteMonitoringTabParams[ tabName ].includes( key ) ) {
			keysToDelete.push( key );
		}
	} );

	keysToDelete.forEach( ( key ) => {
		url.searchParams.delete( key );
	} );

	return url.search;
}
