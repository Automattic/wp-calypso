/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the raw `isResolving` value for a given reducer key, selector name,
 * and arguments set. May be undefined if the selector has never been resolved
 * or not resolved for the given set of arguments, otherwise true or false for
 * resolution started and completed respectively.
 *
 * @param {Object} state        Data state.
 * @param {string} reducerKey   Registered store reducer key.
 * @param {string} selectorName Selector name.
 * @param {Array}  args         Arguments passed to selector.
 *
 * @return {?boolean} isResolving value.
 */
export function getIsResolving( state, reducerKey, selectorName, args ) {
	const map = get( state, [ reducerKey, selectorName ] );
	if ( ! map ) {
		return;
	}

	return map.get( args );
}

/**
 * Returns true if resolution has already been triggered for a given reducer
 * key, selector name, and arguments set.
 *
 * @param {Object} state        Data state.
 * @param {string} reducerKey   Registered store reducer key.
 * @param {string} selectorName Selector name.
 * @param {?Array} args         Arguments passed to selector (default `[]`).
 *
 * @return {boolean} Whether resolution has been triggered.
 */
export function hasStartedResolution( state, reducerKey, selectorName, args = [] ) {
	return getIsResolving( state, reducerKey, selectorName, args ) !== undefined;
}

/**
 * Returns true if resolution has completed for a given reducer key, selector
 * name, and arguments set.
 *
 * @param {Object} state        Data state.
 * @param {string} reducerKey   Registered store reducer key.
 * @param {string} selectorName Selector name.
 * @param {?Array} args         Arguments passed to selector.
 *
 * @return {boolean} Whether resolution has completed.
 */
export function hasFinishedResolution( state, reducerKey, selectorName, args = [] ) {
	return getIsResolving( state, reducerKey, selectorName, args ) === false;
}

/**
 * Returns true if resolution has been triggered but has not yet completed for
 * a given reducer key, selector name, and arguments set.
 *
 * @param {Object} state        Data state.
 * @param {string} reducerKey   Registered store reducer key.
 * @param {string} selectorName Selector name.
 * @param {?Array} args         Arguments passed to selector.
 *
 * @return {boolean} Whether resolution is in progress.
 */
export function isResolving( state, reducerKey, selectorName, args = [] ) {
	return getIsResolving( state, reducerKey, selectorName, args ) === true;
}
