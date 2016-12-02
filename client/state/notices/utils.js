/**
 * Internal dependencies
 */
import { successNotice, errorNotice } from 'state/notices/actions';

export function dispatchSuccess( ...args ) {
	return ( dispatch ) => dispatch( successNotice.apply( null, args ) );
}

export function dispatchError( ...args ) {
	return ( dispatch ) => dispatch( errorNotice.apply( null, args ) );
}
