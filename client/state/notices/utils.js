/**
 * Internal dependencies
 */
import { successNotice, errorNotice } from 'state/notices/actions';

export function dispatchSuccess( ...args ) {
	return ( dispatch ) => dispatch( successNotice( ...args ) );
}

export function dispatchError( ...args ) {
	return ( dispatch ) => dispatch( errorNotice( ...args ) );
}
