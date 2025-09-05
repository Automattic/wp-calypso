import { LogType } from '@automattic/api-core';
import type { Filter } from '@wordpress/dataviews';

const SEVERITY_LABELS: Readonly< Record< string, string > > = {
	user: 'User',
	warning: 'Warning',
	deprecated: 'Deprecated',
	fatal: 'Fatal error',
	'fatal error': 'Fatal error',
	fatal_error: 'Fatal error',
};

type SimpleFilter = {
	field: string;
	operator: 'isAny';
	value: string[];
};

export function getAllowedFields( logType: LogType ): ReadonlyArray< string > {
	return logType === LogType.PHP
		? [ 'severity' ]
		: [ 'cached', 'renderer', 'request_type', 'status' ];
}

export function getInitialFiltersFromSearch( logType: LogType, search: string ): Filter[] {
	const allowed = getAllowedFields( logType );
	const params = new URLSearchParams( search );

	const decode = ( value: string ): string => {
		const withSpaces = value.replace( /\+/g, ' ' );
		try {
			return decodeURIComponent( withSpaces );
		} catch {
			return withSpaces;
		}
	};

	const normalizeSeverity = ( values: string[] ): string[] =>
		Array.from(
			new Set(
				values
					.map( ( v ) => SEVERITY_LABELS[ v.trim().toLowerCase() ] )
					.filter( Boolean ) as string[]
			)
		);

	const out: Filter[] = [];
	for ( const field of allowed ) {
		const raw = params.get( field );
		if ( ! raw ) {
			continue;
		}
		let values = raw
			.split( ',' )
			.map( ( rawToken ) => decode( rawToken ).trim() )
			.filter( Boolean );
		if ( field === 'severity' ) {
			values = normalizeSeverity( values );
		}
		if ( values.length ) {
			out.push( { field, operator: 'isAny', value: values } satisfies SimpleFilter );
		}
	}
	return out;
}
