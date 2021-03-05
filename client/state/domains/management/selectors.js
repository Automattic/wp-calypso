/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/domains/init';

export function isUpdatingWhois( state, domain ) {
	return get( state, [ 'domains', 'management', 'isSaving', `${ domain }`, 'saving' ], false );
}

export function getWhoisData( state, domain ) {
	return get( state, [ 'domains', 'management', 'items', `${ domain }` ], null );
}

export function getWhoisSaveError( state, domain ) {
	const status = get(
		state,
		[ 'domains', 'management', 'isSaving', `${ domain }`, 'status' ],
		null
	);

	if ( ! isUpdatingWhois( state, domain ) && 'error' === status ) {
		return get(
			state,
			[ 'domains', 'management', 'isSaving', `${ domain }`, 'error' ],
			'unknown error'
		);
	}

	return null;
}

export function getWhoisSaveSuccess( state, domain ) {
	const status = get(
		state,
		[ 'domains', 'management', 'isSaving', `${ domain }`, 'status' ],
		null
	);

	return ! isUpdatingWhois( state, domain ) && 'success' === status;
}
