/**
 * @format
 */

/**
 * Internal dependencies
 */
import wpcomUndocumented from 'lib/wpcom-undocumented';
import { http } from './actions';

export default wpcomUndocumented( ( request, fn ) => {
	let action;
	fn( a => ( action = a ) );
	return http( request, action );
} );

/*
 * Creates a callback that can be passed to `wpcom` handlers and allow to pass
 * `action` object to them.
 */
export const returnAction = action => cb => cb( action );
