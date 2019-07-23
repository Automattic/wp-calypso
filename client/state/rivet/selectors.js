/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export function isRequesting( state ) {
	return get( state, 'rivet.isRequesting', false );
}

export function getError( state ) {
	return get( state, 'rivet.error', null );
}

export function getSuggestions( state ) {
	return get( state, 'rivet.suggestions', null );
}
