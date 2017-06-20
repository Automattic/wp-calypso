/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { addHandlers } from 'state/data-layer/extensions-middleware';
import settings from './settings';
import debugFactory from 'debug';

const debug = debugFactory( 'wp-job-manager:errors' );
const handlers = mergeHandlers( settings );

export default function installActionHandlers() {
	const added = addHandlers( 'wp-job-manager', handlers );

	if ( ! added ) {
		debug( 'Failed to add action handlers for "wp-job-manager"' );
	}
}
