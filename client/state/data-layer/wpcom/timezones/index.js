/**
 * External dependencies
 */
import { fromPairs, map, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { TIMEZONES_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { timezonesReceive } from 'state/timezones/actions';

/**
 * Converts an value/label pairs from API into object whose
 * keys are the values and whose values are the labels.
 *
 * @example
 * valueLabelToObject( [ { value: 'foo', label: 'bar' }, { value: 'biz', label: 'bat' } ] )
 * // returns { foo: 'bar', biz: 'bat' }
 *
 * @param {ValueLabelRecord[]} pairs - timezone values and display labels
 * @returns {ValueLabelMap} object whose keys are timezone values, values are timezone labels
 */
const timezonePairsToMap = pairs => (
	fromPairs( map( pairs, ( { label, value } ) => ( [ value, label ] ) ) )
);

/**
 * Normalize data gotten from the REST API making them more Calypso friendly.
 *
 * @param {Object} data - REST-API response
 * @return {Object} normalized timezones data.
 */
export const fromApi = ( { manual_utc_offsets, timezones, timezones_by_continent } ) => ( {
	rawOffsets: timezonePairsToMap( manual_utc_offsets ),
	labels: timezonePairsToMap( timezones ),
	byContinents: mapValues( timezones_by_continent, zones => map( zones, ( { value } ) => ( value ) ) )
} );

/*
 * Start a request to WordPress.com server to get the timezones data
 */
export const fetchTimezones = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				method: 'GET',
				path: '/timezones',
				apiNamespace: 'wpcom/v2',
			},
			action,
		),
	);

export const addTimezones = ( { dispatch }, action, data ) =>
	dispatch( timezonesReceive( fromApi( data ) ) );

export default {
	[ TIMEZONES_REQUEST ]: [ dispatchRequest( fetchTimezones, addTimezones ) ],
};
