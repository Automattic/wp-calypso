/**
 * External dependencies
 */
import { sortBy } from 'lodash';

const getRequestActivityLogsId = ( siteId, filter ) => {
	const knownFilterOptions = [
		'action',
		'after',
		'aggregate',
		'before',
		'by',
		'dateRange',
		'group',
		'name',
		'notGroup',
		'number',
		'on',
		'sortOrder',
	];
	const filterCacheKey = knownFilterOptions
		.map( ( opt ) => {
			const optionValue = filter[ opt ];
			if ( typeof optionValue === 'undefined' ) {
				return undefined;
			}

			const cacheKeyValue = String(
				Array.isArray( optionValue ) ? sortBy( optionValue ) : optionValue
			);

			return `${ opt }=${ cacheKeyValue }`;
		} )
		.filter( ( pair ) => pair )
		.join( '-' );

	return `activity-log-${ siteId }-${ filterCacheKey }`;
};

export default getRequestActivityLogsId;
