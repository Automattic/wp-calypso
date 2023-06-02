import { map, mapValues } from 'lodash';
import { TIMEZONES_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { timezonesReceive } from 'calypso/state/timezones/actions';

const noop = () => {};

/**
 * Converts an value/label pairs from API into object whose
 * keys are the values and whose values are the labels.
 *
 * @example
 * valueLabelToObject( [ { value: 'foo', label: 'bar' }, { value: 'biz', label: 'bat' } ] )
 * // returns { foo: 'bar', biz: 'bat' }
 * @param {Array} pairs - timezone values and display labels
 * @returns {Object} object whose keys are timezone values, values are timezone labels
 */
const timezonePairsToMap = ( pairs ) =>
	Object.fromEntries( map( pairs, ( { label, value } ) => [ value, label ] ) );

/**
 * Normalize data gotten from the REST API making them more Calypso friendly.
 *
 * @returns {Object} normalized timezones data.
 */
export const fromApi = ( { manual_utc_offsets, timezones, timezones_by_continent } ) => ( {
	rawOffsets: timezonePairsToMap( manual_utc_offsets ),
	labels: timezonePairsToMap( timezones ),
	byContinents: mapValues( timezones_by_continent, ( zones ) =>
		map( zones, ( { value } ) => value )
	),
} );

/*
 * Start a request to WordPress.com server to get the timezones data
 */
export const fetchTimezones = ( action ) =>
	http(
		{
			method: 'GET',
			path: '/timezones',
			apiNamespace: 'wpcom/v2',
		},
		action
	);

export const addTimezones = ( action, data ) => timezonesReceive( data );

registerHandlers( 'state/data-layer/wpcom/timezones/index.js', {
	[ TIMEZONES_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchTimezones,
			onSuccess: addTimezones,
			onError: noop,
			fromApi,
		} ),
	],
} );
