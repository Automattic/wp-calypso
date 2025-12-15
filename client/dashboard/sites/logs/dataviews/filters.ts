import { LogType } from '@automattic/api-core';
import type { Filter } from '@wordpress/dataviews';

export function filtersSignature(
	filters: Filter[] | undefined,
	allowed: ReadonlyArray< string >
): string {
	return allowed
		.slice()
		.sort()
		.map( ( field ) => {
			const raw = filters?.find( ( filter ) => filter.field === field )?.value;
			const values = Array.isArray( raw ) ? ( raw as string[] ).slice().sort() : [];
			return `${ field }:${ values.slice().sort().join( ',' ) }`;
		} )
		.join( '|' );
}

export function getAllowedFields( logType: LogType ): ReadonlyArray< string > {
	return logType === LogType.PHP
		? [ 'severity' ]
		: [ 'cached', 'renderer', 'request_type', 'status' ];
}
