/**
 * Internal dependencies
 */
import { addHandlers } from 'state/data-layer/extensions-middleware';
import settings from './settings';
import debugFactory from 'debug';

const debug = debugFactory( 'wp-job-manager:errors' );

export default function installActionHandlers() {
	const added = addHandlers( 'wp-job-manager', settings );

	if ( ! added ) {
		debug( 'Failed to add action handlers for "wp-job-manager"' );
	}
}
