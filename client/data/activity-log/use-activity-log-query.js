import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import { filterStateToApiQuery } from 'calypso/state/activity-log/utils';
import fromActivityLogApi from 'calypso/state/data-layer/wpcom/sites/activity/from-api';

const KNOWN_FILTER_OPTIONS = [
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

function getFilterKey( filter ) {
	return KNOWN_FILTER_OPTIONS.filter( ( opt ) => filter[ opt ] !== undefined )
		.map( ( opt ) => {
			const optionValue = filter[ opt ];
			const cacheKeyValue = Array.isArray( optionValue )
				? optionValue.slice().sort().join( ',' )
				: optionValue;
			return `${ opt }=${ cacheKeyValue }`;
		} )
		.join( '-' );
}

export default function useActivityLogQuery( siteId, filter, options ) {
	return useQuery(
		[ 'activity-log', siteId, getFilterKey( filter ) ],
		() =>
			wpcom.req
				.get(
					{ path: `/sites/${ siteId }/activity`, apiNamespace: 'wpcom/v2' },
					filterStateToApiQuery( filter )
				)
				.then( fromActivityLogApi ),
		{
			refetchInterval: 5 * 60 * 1000,
			...options,
		}
	);
}
