/**
 * External dependencies
 */
import {
	fromPairs,
	map,
	mapValues,
} from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

import { TIMEZONES_REQUEST } from 'state/action-types';

import {
	timezonesRequestSuccess,
	timezonesRequestFailure,
	timezonesReceive,
} from 'state/timezones/actions';

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
export const fetchTimezones = ( { dispatch }, action, next ) => {
	wpcom.req.get( '/timezones', { apiNamespace: 'wpcom/v2' } )
		.then( data => {
			dispatch( timezonesRequestSuccess() );
			dispatch( timezonesReceive( fromApi( data ) ) );
		} )
		.catch( error => {
			dispatch( timezonesRequestFailure( error ) );
		} );

	return next( action );
};

export default {
	[ TIMEZONES_REQUEST ]: [ fetchTimezones ],
};
