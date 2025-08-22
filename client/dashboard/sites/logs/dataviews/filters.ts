import { LogType } from '../../../data/site-logs';
import type { Filter } from '@wordpress/dataviews';

export function getInitialFiltersFromSearch( logType: LogType, search: string ): Filter[] {
	const allowed =
		logType === LogType.PHP ? [ 'severity' ] : [ 'cached', 'renderer', 'request_type', 'status' ];
	const params = new URLSearchParams( search );

	const decode = ( value: string ): string => {
		const withSpaces = value.replace( /\+/g, ' ' );
		try {
			return decodeURIComponent( withSpaces );
		} catch {
			return withSpaces;
		}
	};

	const normalizeSeverity = ( values: string[] ): string[] => {
		const map: Record< string, string > = {
			user: 'User',
			warning: 'Warning',
			deprecated: 'Deprecated',
			fatal: 'Fatal error',
			'fatal error': 'Fatal error',
			fatal_error: 'Fatal error',
		};
		return Array.from(
			new Set( values.map( ( v ) => map[ v.trim().toLowerCase() ] ).filter( Boolean ) as string[] )
		);
	};

	const out: Filter[] = [];
	for ( const field of allowed ) {
		const raw = params.get( field );
		if ( ! raw ) {
			continue;
		}
		let values = raw
			.split( ',' )
			.map( ( s ) => decode( s ) )
			.map( ( s ) => s.trim() )
			.filter( Boolean );
		if ( field === 'severity' ) {
			values = normalizeSeverity( values );
		}
		if ( values.length ) {
			out.push( { field, operator: 'isAny', value: values } as unknown as Filter );
		}
	}
	return out;
}
