/**
 * External dependencies
 */
import { isArray, isUndefined, sortBy } from 'lodash';

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
			if ( isUndefined( optionValue ) ) {
				return undefined;
			}

			const cacheKeyValue = String( isArray( optionValue ) ? sortBy( optionValue ) : optionValue );

			return `${ opt }=${ cacheKeyValue }`;
		} )
		.filter( ( pair ) => pair )
		.join( '-' );

	return `activity-log-${ siteId }-${ filterCacheKey }`;
};

export default getRequestActivityLogsId;
