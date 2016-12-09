/**
 * Internal dependencies
 */
import { successNotice, errorNotice } from 'state/notices/actions';

export function dispatchSuccess( message ) {
	return ( dispatch ) => dispatch( successNotice( message ) );
}

export function dispatchError( message ) {
	return ( dispatch ) => dispatch( errorNotice( message ) );
}
