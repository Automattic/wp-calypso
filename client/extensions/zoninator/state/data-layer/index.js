/**
 * Internal dependencies
 */
import { addHandlers } from 'state/data-layer/extensions-middleware';
import zones from './zones';
import debugFactory from 'debug';

const debug = debugFactory( 'zoninator:errors' );

export default function installActionHandlers() {
	const added = addHandlers( 'zoninator', zones );

	if ( ! added ) {
		debug( 'Failed to add action handlers for "zoninator"' );
	}
}
