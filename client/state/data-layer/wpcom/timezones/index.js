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
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

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
 * timezonePairsToMap( [ { value: 'foo', label: 'bar' }, { value: 'biz', label: 'bat' } ] )
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

/**
 * Dispaches a request to fetch timezones data from WordPress WP REST API
 * https://public-api.wordpress.com/wpcom/v2/timezones
 *
 * @param {Function} dispatch - Redux dispatcher
 * @param {Object} action - Redux action
 * @param {Function} next - data-layer-bypassing dispatcher
 * @returns {Object} original action
 */
export const requestTimezones = ( { dispatch }, action, next ) => {
	dispatch( http( {
		apiNamespace: 'wpcom/v2',
		method: 'GET',
		path: '/timezones',
		onSuccess: action,
		onFailure: action,
	} ) );

	return next( action );
};

/**
 * Dispatches returned timezones data
 *
 * @param {Function} dispatch - Redux dispatcher
 * @param {Object} action - Redux action
 * @param {Function} next - dispatches to next middleware in chain
 * @param {Object} timezones - raw data from timezones endpoint response
 */
export const receiveTimezones = ( { dispatch }, action, next, timezones ) => {
	dispatch( timezonesRequestSuccess() );
	dispatch( timezonesReceive( fromApi( timezones ) ) );
};

/**
 * Dispatches returned error from timezones request
 *
 * @param {Function} dispatch - Redux dispatcher
 * @param {Object} action - Redux action
 * @param {Function} next - dispatches to next middleware in chain
 * @param {Object} rawError - raw error from HTTP request
 */
export const receiveError = ( { dispatch }, action, next, rawError ) => {
	const error = rawError instanceof Error
		? rawError.message
		: rawError;

	dispatch( timezonesRequestFailure( error ) );
};

export const dispatchTimezonesRequest = dispatchRequest( requestTimezones, receiveTimezones, receiveError );

export default {
	[ TIMEZONES_REQUEST ]: [ dispatchTimezonesRequest ],
};
